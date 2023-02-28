import { getVideoSegments } from "@/apis/sponsorblock";
import { getVideoInfoFormatted } from "../db/videos";
import { getXMLCaptions } from "./captions";
import { getTranscriptsInTime } from "./transcripts";
import { getSegmentAnnotationsOpenAICall } from "../db/bots";
import { updateVideoSponsorsFromDB } from "../db/sponsors";
import { getChannel, getVideoInfo } from "@/apis/youtube";
import { getVideosContinuation } from "./channel";

import Channel, {
  ChannelListContinuation,
} from "youtubei.js/dist/src/parser/youtube/Channel";
import Video from "youtubei.js/dist/src/parser/classes/Video";
import type { Context } from "../trpc/context";
import type { GetSegmentAnnotationsType } from "../db/bots";

const SERVER_URL = process.env.NEXTAUTH_URL;

export const processVideo = async ({
  videoId,
  ctx,
  options,
}: {
  videoId: string;
  ctx: Context;
  options?: {
    callServer: boolean;
  };
}) => {
  const videoInfo = await getVideoInfoFormatted({
    input: { videoID: videoId },
  });
  const englishCaptionTracks = videoInfo?.captions.caption_tracks?.filter(
    (t) => t.language_code === "en" || t.language_code === "en-US"
  );
  if (!englishCaptionTracks?.[0]?.base_url) {
    throw new Error("no english captions found");
  }
  const [captions, segments] = await Promise.all([
    getXMLCaptions(englishCaptionTracks[0].base_url),
    getVideoSegments({
      userID: ctx.session?.user?.id ?? "sponsortubebot",
      videoID: videoId,
    }),
  ]);

  const segmentTranscripts = segments.map((s) => ({
    segment: { ...s },
    ...getTranscriptsInTime({
      transcripts: captions,
      times: { startTimeMS: s.startTime, endTimeMS: s.endTime },
    }),
  }));

  if (options?.callServer) {
    segmentTranscripts.forEach((st) =>
      callServerSegmentAnnotationsOpenAICall({
        segment: st.segment,
        transcript: st.transcript,
        startTime: st.transcriptStart,
        endTime: st.transcriptEnd,
        videoId: videoId,
      })
    );
  } else {
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
            })
        ),
      ]);
    } catch (err) {
      console.log("ERROR?", err);
    }
    await updateVideoSponsorsFromDB({ videoId: videoId });
  }
};

export const callServerSegmentAnnotationsOpenAICall = async (
  input: GetSegmentAnnotationsType
) => {
  console.log("posting ", input?.videoId, input.startTime);
  const JSONdata = JSON.stringify(input);
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  while (videosTab.has_continuation && processMore && page < maxPages) {
    const { videos, hasNext, continuation } = await getVideosContinuation({
      videosTab,
      //cursor: 1,
    });
    processMore = hasNext;
    if (from && videos?.length > 0 && videos?.[videos?.length - 1]?.id) {
      const lastVideo = await getVideoInfo({
        videoID: videos?.[videos?.length - 1]?.id as string,
      });
      const lastDate = Date.parse(lastVideo.primary_info?.published.text ?? "");
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
    if (continuation) {
      console.log("assign continuation");
      videosTab = continuation;
    }
    if (videos.length > 0) {
      allVods = [...allVods, ...videos];
    }
    page += 1;
  }
  allVods.forEach((v) => {
    console.log(v.published.text, v.title.text);
    callServerProcessVideo({ videoId: v.id });
  });

  console.log("VODS?", allVods.length, allVods[0]);
};

const callServerProcessVideo = async (input: { videoId: string }) => {
  console.log("posting ", input?.videoId);
  const JSONdata = JSON.stringify(input);
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSONdata,
  };
  const res = await fetch(`${SERVER_URL}/api/process/video`, options);
  return;
};
