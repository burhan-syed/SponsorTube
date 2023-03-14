import { getVideoSegments } from "@/apis/sponsorblock";
import { getXMLCaptions } from "./captions";
import { getTranscriptsInTime } from "./transcripts";
import { getSegmentAnnotationsOpenAICall } from "../db/bots";
import { getChannel, getVideoInfo } from "@/apis/youtube";
import { getVideosContinuation } from "./channel";
import { TRPCError } from "@trpc/server";
import { CustomError } from "../common/errors";

import Channel, {
  ChannelListContinuation,
} from "youtubei.js/dist/src/parser/youtube/Channel";
import type Video from "youtubei.js/dist/src/parser/classes/Video";
import type { Context } from "../trpc/context";
import type { GetSegmentAnnotationsType } from "../db/bots";
import type { C4TabbedHeader } from "youtubei.js/dist/src/parser/map";
import type { ProcessQueue } from "@prisma/client";
import type { VideoInfo } from "youtubei.js/dist/src/parser/youtube";

const SECRET = process?.env?.MY_SECRET_KEY ?? "";
const SERVER_URL = process.env.SERVER_URL;

export const processVideo = async ({
  videoId,
  channelId,
  queueId,
  ctx,
  options,
}: {
  videoId: string;
  channelId?: string;
  queueId?: string;
  ctx: Context;
  options?: {
    spawnProcess?: boolean;
  };
}) => {
  queueId && console.log("processing video with queue", queueId, videoId);

  let preVidInfo: VideoInfo | undefined;

  if (!channelId) {
    preVidInfo = await getVideoInfo({ videoID: videoId });
  }

  if (!channelId && !preVidInfo?.basic_info?.channel?.id) {
    throw new Error(`missing channel id for video ${videoId}`);
  }

  const processQueue = await ctx.prisma.processQueue.upsert({
    where: {
      channelId_videoId_type: {
        channelId: (channelId ?? preVidInfo?.basic_info?.channel?.id) as string,
        videoId,
        type: "video",
      },
    },
    create: {
      status: "pending",
      videoId: videoId,
      channelId: (channelId ?? preVidInfo?.basic_info?.channel?.id) as string,
      parentProcessId: queueId,
      type: "video",
      timeInitialized: new Date(),
    },
    update: {
      status: "pending",
      parentProcessId: queueId,
      timeInitialized: new Date(),
    },
  });

  const completeQueue = async (processQueue: ProcessQueue, error = false) => {
    const completeVideoProcess = ctx.prisma.processQueue.update({
      where: { id: processQueue.id },
      data: {
        status: error ? "error" : "completed",
        lastUpdated: new Date(),
      },
    });
    //don't count number of pending child processes to complete parent process, it's not reliable
    await completeVideoProcess;
  };

  try {
    const [segments, videoInfo] = await Promise.all([
      getVideoSegments({
        userID: ctx.session?.user?.id ?? "sponsortubebot",
        videoID: videoId,
      }),
      preVidInfo ? preVidInfo : getVideoInfo({ videoID: videoId }),
    ]);

    if (!videoInfo) {
      await completeQueue(processQueue, true);
      return;
    }

    const englishCaptionTracks = videoInfo?.captions?.caption_tracks?.filter(
      (t) => t.language_code === "en" || t.language_code === "en-US"
    );

    if (
      !segments ||
      !(segments.length > 0) ||
      !englishCaptionTracks?.[0]?.base_url
    ) {
      if (
        videoInfo.basic_info.id &&
        videoInfo.basic_info.channel?.id &&
        videoInfo.primary_info?.published.text
      ) {
        try {
          await ctx.prisma.videos.create({
            data: {
              id: videoInfo.basic_info.id,
              title: videoInfo.basic_info.title,
              published: new Date(
                Date.parse(videoInfo.primary_info?.published.text)
              ),
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
      await completeQueue(processQueue, true);
      return;
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
      let errored = false;
      const calls = await Promise.allSettled(
        segmentTranscripts.map(async (st) => {
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
          });
        })
      );
      const errors = calls
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected"
        )
        .map((e) => e.reason);

      //video is errored if there was an uncaught error or if the caught custom error has a level of complete
      errors.some((e) => {
        if (e instanceof TRPCError && e.cause instanceof CustomError) {
          console.log("is custom error", e.cause);
          if (e.cause.level === "COMPLETE") {
            errored = true;
            return true;
          }
          return false;
        }
        errored = true;
        return true;
      });
      console.log("done processing video segments", {
        videoId,
        segmentTranscriptsLength: segmentTranscripts.length,
        errors: errors,
        errorsLength: errors.length,
        errored,
      });
      await completeQueue(processQueue, errored);
    }
  } catch (err) {
    await completeQueue(processQueue, true);
    throw err;
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
  maxPages = 4,
}: {
  channelId: string;
  ctx: Context;
  maxPages?: number;
}) => {
  const prevQueue = await ctx.prisma.processQueue.findUnique({
    where: {
      channelId_videoId_type: {
        channelId,
        videoId: "",
        type: "channel_videos",
      },
    },
  });
  if (prevQueue?.status === "pending" || prevQueue?.status === "completed") {
    // const pChannelSummaryPromise = ctx.prisma.processQueue.findUnique({
    //   where: {
    //     channelId_videoId_type: {
    //       channelId,
    //       videoId: "",
    //       type: "channel_summary",
    //     },
    //   },
    // });
    if (prevQueue?.status === "pending") {
      const pendingChildProcesses = await ctx.prisma.processQueue.findMany({
        where: { parentProcessId: prevQueue.id, status: "pending" },
      });
      if (pendingChildProcesses?.length > 0) {
        console.log("pending?", pendingChildProcesses);
        throw new Error(
          `channel process pending from ${prevQueue.timeInitialized}`
        );
      }
    }
    // const pChannelSummary = await pChannelSummaryPromise;
    // if (!pChannelSummary || pChannelSummary.status !== "pending") {
    //   summarizeChannelCall({ channelId });
    // }
  }

  const channel = await getChannel({ channelID: channelId });
  if (!channel) {
    return;
  }

  const newQueue = await ctx.prisma.processQueue.upsert({
    where: {
      channelId_videoId_type: {
        channelId,
        videoId: "",
        type: "channel_videos",
      },
    },
    create: {
      Channel: {
        connectOrCreate: {
          where: { id: channelId },
          create: {
            id: channelId,
            name: (channel.header as C4TabbedHeader)?.author?.name,
          },
        },
      },
      type: "channel_videos",
      status: "pending",
      timeInitialized: new Date(),
    },
    update: {
      status: "pending",
      timeInitialized: new Date(),
    },
  });

  const completedVodsMap = new Map<string, boolean>();
  (
    await ctx.prisma.processQueue.findMany({
      where: {
        channelId: channelId,
        videoId: { not: "" },
        type: "video",
        status: "completed",
      },
      select: { videoId: true },
    })
  ).forEach((v) => v.videoId && completedVodsMap.set(v.videoId, true));

  console.log("CHANNEL PROCESS QUEUE:", newQueue.id);

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
    // if (from && videos?.length > 0 && videos?.[videos?.length - 1]?.id) {
    //   const lastVideo = await getVideoInfo({
    //     videoID: videos?.[videos?.length - 1]?.id as string,
    //   });
    //   if (lastVideo) {
    //     const lastDate =
    //       lastVideo.primary_info?.published.text &&
    //       new Date(Date.parse(lastVideo.primary_info?.published.text ?? ""));
    //     console.log({
    //       lastDate,
    //       lastDateString: lastVideo.primary_info?.published.text,
    //       from,
    //       fromString: new Date(from),
    //       page,
    //     });
    //     if (lastDate && from > lastDate) {
    //       processMore = false;
    //     }
    //   }
    // }
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

  const filteredVods = allVods.filter(
    (v) => completedVodsMap.get(v.id) !== true
  );
  //.slice(10, 20);

  const spawnProcesses = await Promise.allSettled(
    filteredVods.map((v) =>
      spawnVideoProcess({
        videoId: v.id,
        channelId: channelId,
        queueId: newQueue.id,
      })
    )
  );

  const endServerCall = performance.now();
  console.log("VODS PROCESSSED?", {
    timeToFetch: endFetch - start,
    timeToSend: endServerCall - endFetch,
    pages: page,
    allvods: allVods.length,
    filtered: filteredVods.length,
    completed: completedVodsMap.size,
    errored: spawnProcesses?.filter((s) => s.status === "rejected")?.length,
  });

  await summarizeChannelCall({ channelId });
};

const spawnVideoProcess = async (input: {
  videoId: string;
  channelId: string;
  queueId?: string;
}) => {
  const JSONdata = JSON.stringify(input);
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: SECRET },
    body: JSONdata,
  };
  console.log("call", input.videoId, input.channelId);
  const res = await fetch(`${SERVER_URL}/api/process/video`, options); //
  console.log("res?", input.videoId, res.status);
  return;
};

const summarizeChannelCall = async (input: { channelId: string }) => {
  const JSONdata = JSON.stringify(input);
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: SECRET },
    body: JSONdata,
  };
  const res = await fetch(`${SERVER_URL}/api/process/channel-summary`, options);
  return;
};
