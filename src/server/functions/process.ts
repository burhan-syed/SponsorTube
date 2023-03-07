import { getVideoSegments } from "@/apis/sponsorblock";
import { getXMLCaptions } from "./captions";
import { getTranscriptsInTime } from "./transcripts";
import { getSegmentAnnotationsOpenAICall } from "../db/bots";
import { getChannel, getVideoInfo } from "@/apis/youtube";
import { getVideosContinuation } from "./channel";
import Channel, {
  ChannelListContinuation,
} from "youtubei.js/dist/src/parser/youtube/Channel";
import type Video from "youtubei.js/dist/src/parser/classes/Video";
import type { Context } from "../trpc/context";
import type { GetSegmentAnnotationsType } from "../db/bots";
import { TRPCError } from "@trpc/server";

const SECRET = process?.env?.MY_SECRET_KEY ?? "";
const SERVER_URL = process.env.NEXTAUTH_URL;

export const processVideo = async ({
  videoId,
  ctx,
  options,
}: {
  videoId: string;
  ctx: Context;
  options?: {
    spawnProcess: boolean;
  };
}) => {
  const [segments, videoInfo] = await Promise.all([
    getVideoSegments({
      userID: ctx.session?.user?.id ?? "sponsortubebot",
      videoID: videoId,
    }),
    getVideoInfo({ videoID: videoId }),
  ]);

  if (!videoInfo) {
    return;
  }

  if (!segments || !(segments.length > 0) || !videoInfo?.captions) {
    if (videoInfo.basic_info.id && videoInfo.basic_info.channel?.id) {
      try {
        await ctx.prisma.videos.create({
          data: {
            id: videoInfo.basic_info.id,
            title: videoInfo.basic_info.title,
            published: videoInfo.primary_info?.published.text
              ? new Date(Date.parse(videoInfo.primary_info?.published.text))
              : undefined,
            duration: videoInfo.basic_info.duration,
            thumbnail:
              videoInfo.basic_info.thumbnail?.[0]?.url?.split("?")?.[0],
            thumbnailHeight: videoInfo.basic_info.thumbnail?.[0]?.height,
            thumbnailWidth: videoInfo.basic_info.thumbnail?.[0]?.width,
            Channel: {
              connectOrCreate: {
                where: { id: videoInfo.basic_info.channel?.id },
                create: {
                  id: videoInfo.basic_info.channel?.id,
                  name: videoInfo.basic_info.channel?.name,
                },
              },
            },
          },
        });
      } catch (err) {}
    }
    return;
  }

  const englishCaptionTracks = videoInfo?.captions.caption_tracks?.filter(
    (t) => t.language_code === "en" || t.language_code === "en-US"
  );
  if (!englishCaptionTracks?.[0]?.base_url) {
    throw new Error("no english captions found");
  }
  const captions = await getXMLCaptions(englishCaptionTracks[0].base_url);

  const segmentTranscripts = segments.map((s) => ({
    segment: { ...s },
    ...getTranscriptsInTime({
      transcripts: captions,
      times: { startTimeMS: s.startTime, endTimeMS: s.endTime },
    }),
  }));

  if (options?.spawnProcess) {
    segmentTranscripts.forEach((st) =>
      spawnSegmentAnnotationsOpenAICallProcess({
        segment: st.segment,
        transcript: st.transcript,
        startTime: st.transcriptStart,
        endTime: st.transcriptEnd,
        videoId: videoId,
      })
    );
  } else {
    console.log(
      "processing video segments",
      videoId,
      segmentTranscripts.length
    );
    try {
      await Promise.all([
        ...segmentTranscripts.map(
          async (st) =>
            await getSegmentAnnotationsOpenAICall({
              input: {
                segment: st.segment,
                transcript: st.transcript,
                startTime: st.transcriptStart,
                endTime: st.transcriptEnd,
                videoId: videoId,
              },
              ctx: ctx,
              inputVideoInfo: videoInfo,
            })
        ),
      ]);
    } catch (err) {
      if (err instanceof TRPCError && err.code === "CONFLICT") {
        console.log(err.message);
      } else {
        console.log("ERROR?", err);
      }
    }
    console.log(
      "done processing video segments",
      videoId,
      segmentTranscripts.length
    );
  }
};

export const spawnSegmentAnnotationsOpenAICallProcess = async (
  input: GetSegmentAnnotationsType
) => {
  const JSONdata = JSON.stringify(input);
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: SECRET },
    body: JSONdata,
  };
  const res = await fetch(`${SERVER_URL}/api/process/segment`, options);
  return;
};

export const processChannel = async ({
  channelId,
  ctx,
  maxPages = 1,
}: {
  channelId: string;
  ctx: Context;
  maxPages?: number;
}) => {
  const queue = await ctx.prisma.channelQueue.findUnique({
    where: { id: channelId },
  });
  if (queue?.status === "pending") {
    throw new Error(`channel process pending from ${queue.timeInitialized}`);
  }

  const channel = await getChannel({ channelID: channelId });
  if (!channel) {
    return;
  }
  // await ctx.prisma.channelQueue.upsert({
  //   where: { id: channelId },
  //   create: {
  //     Channel: {
  //       connectOrCreate: {
  //         where: { id: channelId },
  //         create: {
  //           id: channelId,
  //           name: (channel.header as C4TabbedHeader)?.author?.name,
  //         },
  //       },
  //     },
  //     status: "pending",
  //     timeInitialized: new Date(),
  //   },
  //   update: {
  //     status: "pending",
  //     timeInitialized: new Date(),
  //   },
  // });
  // const channelStats = await prisma?.channelStats.findUnique({
  //   where: { channelId },
  // });
  //const from = channelStats?.processedFrom;
  const from = Date.parse(`Nov 16, 2022`);
  let videosTab: Channel | ChannelListContinuation = await channel.getVideos();
  let allVods: Video[] = [];
  let processMore = true;
  let page = 0;
  const start = performance.now();
  while (
    (page === 0 || videosTab.has_continuation) &&
    processMore &&
    page < maxPages
  ) {
    const { videos, hasNext, continuation } = (await getVideosContinuation({
      videosTab,
      //cursor: 1,
    })) as {
      videos: Video[];
      hasNext: boolean;
      continuation: ChannelListContinuation;
    };
    processMore = hasNext;
    if (from && videos?.length > 0 && videos?.[videos?.length - 1]?.id) {
      const lastVideo = await getVideoInfo({
        videoID: videos?.[videos?.length - 1]?.id as string,
      });
      if (lastVideo) {
        const lastDate = Date.parse(
          lastVideo.primary_info?.published.text ?? ""
        );
        console.log({
          lastDate,
          lastDateString: lastVideo.primary_info?.published.text,
          from,
          fromString: new Date(from),
          page,
        });
        if (lastVideo.primary_info?.published.text && from > lastDate) {
          processMore = false;
        }
      }
    }
    if (continuation) {
      console.log("assign continuation");
      videosTab = continuation;
    }
    if (videos.length > 0) {
      allVods = [...allVods, ...videos];
    }
    page += 1;
  }
  const endFetch = performance.now();

  //allVods = allVods.slice(0, 5);

  await Promise.all(
    allVods.map(async (v) => {
      console.log("call", v.published.text, v.title.text);
      await spawnVideoProcess({ videoId: v.id });
    })
  );
  const endServerCall = performance.now();
  console.log("VODS?", allVods.length, {
    timeToFetch: endFetch - start,
    timeToSend: endServerCall - endFetch,
  });
};

const spawnVideoProcess = async (input: { videoId: string }) => {
  const JSONdata = JSON.stringify(input);
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: SECRET },
    body: JSONdata,
  };
  const res = await fetch(`${SERVER_URL}/api/process/video`, options);
  return;
};
