import { getVideoSegments } from "@/apis/sponsorblock";
import { getXMLCaptions } from "./captions";
import { getTranscriptsInTime } from "./transcripts";
import { getBotIds, getSegmentAnnotationsOpenAICall } from "../db/bots";
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
import type { C4TabbedHeader } from "youtubei.js/dist/src/parser/nodes";
import type { ProcessQueue, QueueStatus } from "@prisma/client";
import type { VideoInfo } from "youtubei.js/dist/src/parser/youtube";
import { saveVideoDetails } from "../db/videos";
import { saveTranscript } from "../db/transcripts";

const OPENAI_RPM = 20;
const SECRET = process?.env?.MY_SECRET_KEY ?? "";
const SERVER_URL = process.env.SERVER_URL;

export const processVideo = async ({
  videoId,
  channelId,
  queueId,
  botId,
  suppliedVideoInfo,
  ctx,
  options,
}: {
  videoId: string;
  channelId?: string;
  queueId?: string;
  botId?: string;
  ctx: Context;
  suppliedVideoInfo?: VideoInfo;
  options?: {
    spawnProcess?: boolean;
    skipAnnotations?: boolean;
  };
}) => {
  queueId && console.log("processing video with queue", queueId, videoId);

  let preVidInfo = suppliedVideoInfo;

  if (!channelId && !preVidInfo) {
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

  const completeQueue = async (
    processQueue: ProcessQueue,
    status?: QueueStatus
  ) => {
    const completeVideoProcess = ctx.prisma.processQueue.update({
      where: { id: processQueue.id },
      data: {
        status: status ? status : "partial",
        lastUpdated: new Date(),
      },
    });
    //don't count number of pending child processes to complete parent process, it's not reliable
    await completeVideoProcess;
  };

  try {
    const [segmentsResult, videoInfoResult] = await Promise.allSettled([
      getVideoSegments({
        userID: ctx.session?.user?.id ?? "sponsortubebot",
        videoID: videoId,
      }),
      preVidInfo ? preVidInfo : getVideoInfo({ videoID: videoId }),
    ]);

    const videoInfo =
      videoInfoResult.status === "fulfilled"
        ? videoInfoResult.value
        : undefined;
    const segments =
      segmentsResult.status === "fulfilled" ? segmentsResult.value : undefined;

    if (!videoInfo) {
      await completeQueue(processQueue, "error");
      return;
    }

    const englishCaptionTracks = videoInfo?.captions?.caption_tracks?.filter(
      (t) => t.language_code === "en" || t.language_code === "en-US"
    );

    const vodUpsert = async (videoInfo: VideoInfo, segments?: any[]) => {
      if (
        videoInfo.basic_info.id &&
        videoInfo.basic_info.channel?.id &&
        videoInfo.primary_info?.published.text &&
        englishCaptionTracks?.[0]?.base_url //we won't save vods without english transcripts b/c gpt isn't good at deciphering non-english text, this is our best assumption
      ) {
        try {
          const vodUpsert = await ctx.prisma.videos.upsert({
            where: { id: videoInfo.basic_info.id },
            update: {},
            create: {
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
                    hasSponsors:
                      segments && segments.length > 0 ? true : undefined,
                  },
                },
              },
            },
            include: { Channel: true },
          });
          if (
            !vodUpsert.Channel.hasSponsors &&
            segments &&
            segments.length > 0
          ) {
            try {
              await ctx.prisma.channels.update({
                where: { id: videoInfo.basic_info.channel.id },
                data: { hasSponsors: true },
              });
            } catch (err) {}
          }
        } catch (err) {}
      }
    };

    if (
      !segments ||
      !(segments.length > 0) ||
      !englishCaptionTracks?.[0]?.base_url
    ) {
      await vodUpsert(videoInfo, segments);
      await completeQueue(processQueue, "error");
      return;
    }

    let captions: {
      text: string;
      start: number;
      dur: number;
    }[];

    try {
      captions = await getXMLCaptions(englishCaptionTracks[0].base_url);
    } catch (err) {
      await vodUpsert(videoInfo, segments);
      console.log("XMLCAPTIONS ERR");
      throw err;
    }

    const segmentTranscripts = segments.map((s) => ({
      segment: { ...s },
      ...getTranscriptsInTime({
        transcripts: captions,
        times: { startTimeMS: s.startTime, endTimeMS: s.endTime },
      }),
    }));

    let errored = false;
    const checkIfErrored = (calls: PromiseSettledResult<void>[]) => {
      const errors = calls
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected"
        )
        .map((e) => e.reason);

      //video is errored if there was an uncaught error or if the caught custom error has a level of complete
      errors.some((e) => {
        if (e instanceof TRPCError && e.cause instanceof CustomError) {
          //console.log("is custom error", e.cause);
          if (e.cause.level === "COMPLETE") {
            errored = true;
            return true;
          }
          return false;
        }
        errored = true;
        return true;
      });

      return errors;
    };

    if (options?.skipAnnotations) {
      const bot = botId ?? (await ctx.prisma.bots.findFirst())?.id;

      if (!bot) {
        errored = true;
      } else {
        const saveAnnotations = await Promise.allSettled([
          saveVideoDetails({
            ctx: { ...ctx, session: { user: { id: bot }, expires: "" } },
            input: { videoId, segmentIDs: segments.map((s) => s.UUID) },
            inputVideoInfo: videoInfo,
          }),
          ...segmentTranscripts.map(
            async (st) =>
              await saveTranscript({
                input: {
                  segmentUUID: st.segment.UUID,
                  text: st.transcript,
                  endTime: st.transcriptEnd,
                  startTime: st.transcriptStart,
                },
                ctx: {
                  ...ctx,
                  session: { expires: "", user: { id: bot } },
                },
              })
          ),
        ]);
        const errors = checkIfErrored(saveAnnotations);
        console.log("done saving vod transcript", {
          videoId,
          segmentTranscriptsLength: segmentTranscripts.length,
          errors: errors,
          errorsLength: errors.length,
          errored,
        });
      }
      await completeQueue(processQueue, errored ? "error" : "partial");
    } else if (options?.spawnProcess) {
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
      const errors = checkIfErrored(calls);

      // console.log("done processing video segments", {
      //   videoId,
      //   segmentTranscriptsLength: segmentTranscripts.length,
      //   errors: errors,
      //   errorsLength: errors.length,
      //   errored,
      // });
      await completeQueue(processQueue, errored ? "error" : "completed");
    }
  } catch (err) {
    await completeQueue(processQueue, "error");
    throw err;
  }
};

export const processChannelVideoTranscriptAnnotations = async ({
  channelId,
  parentQueueId,
  continueQueue,
  stopAt,
  ctx,
}: {
  channelId: string;
  parentQueueId?: string;
  continueQueue?: true;
  stopAt?: Date;
  ctx: Context;
}) => {
  console.log(
    "process channnel video transcript annotations..",
    channelId,
    parentQueueId,
    continueQueue
  );

  const queue = await ctx.prisma.$transaction(async (tx) => {
    const pQueue = await tx.processQueue.findFirst({
      where: {
        channelId: channelId,
        type: "video_sponsors",
        status: "pending",
      },
    });
    if (pQueue) {
      return continueQueue ? pQueue.id : false;
    }
    const newQueue = await tx.processQueue.upsert({
      where: {
        channelId_videoId_type: {
          channelId: channelId,
          videoId: "",
          type: "video_sponsors",
        },
      },
      update: {
        status: "pending",
        timeInitialized: new Date(),
      },
      create: {
        channelId,
        videoId: "",
        status: "pending",
        parentProcessId: parentQueueId,
        type: "video_sponsors",
        timeInitialized: new Date(),
      },
    });
    return newQueue.id;
  });

  if (!queue) {
    console.error(`channel ${channelId} video sponsor queue already pending`);
    throw new Error("Process still pending");
  }

  const completeVideoQueue = async (videoId: string, errored = false) => {
    await ctx.prisma.processQueue.update({
      where: {
        channelId_videoId_type: {
          channelId,
          videoId: videoId,
          type: "video",
        },
      },
      data: {
        status: errored ? "error" : "completed",
        lastUpdated: new Date(),
      },
    });
  };
  const botIds = await getBotIds({ prisma: ctx.prisma });
  const transcripts = await ctx.prisma.transcripts.findMany({
    where: {
      SponsorSegment: {
        Video: {
          ProcessQueue: {
            some: { type: "video", status: "partial", channelId },
          },
        },
      },
      userId: { in: botIds },
    },
    include: {
      SponsorSegment: {
        select: {
          UUID: true,
          videoID: true,
        },
      },
    },
  });
  console.log(
    "process channnel video transcript annotations..",
    transcripts.length,
    "stop at",
    stopAt
  );
  //delay calls
  let earlyReturn = false;
  let slicedTranscripts = transcripts;
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  if (stopAt) {
    const minutesUntilStop =
      (stopAt.getTime() - new Date().getTime()) / 1000 / 60;
    const numToProcess = Math.floor(OPENAI_RPM * minutesUntilStop);
    slicedTranscripts =
      numToProcess < transcripts.length
        ? transcripts.slice(0, numToProcess)
        : transcripts;

    console.log({
      minutesUntilStop,
      numToProcess,
      transcripts: transcripts.length,
      processing: slicedTranscripts.length,
    });
  }

  await Promise.allSettled(
    slicedTranscripts.map(async (t, index) => {
      await sleep(index * (1000 * (60 / OPENAI_RPM)));
      if (stopAt && new Date() >= stopAt) {
        console.log("STOP");
        earlyReturn = true;
        return;
      }
      let errored = false;
      try {
        console.log("process", t.SponsorSegment.videoID, t.id);
        await getSegmentAnnotationsOpenAICall({
          ctx,
          input: {
            segment: t.SponsorSegment,
            transcript: t.text,
            videoId: t.SponsorSegment.videoID,
            endTime: t.endTime,
            startTime: t.startTime,
            transcriptId: t.id,
          },
          stopAt,
        });
      } catch (err) {
        if (
          !(err instanceof TRPCError) ||
          (err instanceof TRPCError &&
            err.cause instanceof CustomError &&
            err.cause.level === "COMPLETE")
        ) {
          console.log("segment err", err);
          errored = true;
        }
      } finally {
        await completeVideoQueue(t.SponsorSegment.videoID, errored);
      }
    })
  );

  earlyReturn =
    slicedTranscripts.length < transcripts.length ? true : earlyReturn;
  console.log("DONE PROCESSING SEGMENTS", earlyReturn);

  if (!earlyReturn) {
    await Promise.allSettled([
      ctx.prisma.processQueue.update({
        where: {
          channelId_videoId_type: {
            channelId,
            videoId: "",
            type: "video_sponsors",
          },
        },
        data: { status: "completed", lastUpdated: new Date() },
      }),
      ctx.prisma.processQueue.update({
        where: {
          channelId_videoId_type: {
            channelId,
            videoId: "",
            type: "channel_videos",
          },
        },
        data: { status: "completed", lastUpdated: new Date() },
      }),
      summarizeChannelCall({ channelId }),
    ]);
  }

  return earlyReturn;
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
  maxVideos = 25,
  maxPages = undefined,
  limitToPreviousDate = true,
}: {
  channelId: string;
  ctx: Context;
  maxPages?: number;
  maxVideos?: number;
  limitToPreviousDate?: boolean;
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
  if (prevQueue?.status === "pending") {
    const pendingChildProcesses = await ctx.prisma.processQueue.findMany({
      where: {
        channelId,
        type: "video",
        videoId: { not: "" },
        status: "pending",
      },
    });
    if (pendingChildProcesses?.length > 0) {
      console.log("pending?", pendingChildProcesses);
      throw new Error(
        `channel process pending from ${prevQueue.timeInitialized}`
      );
    }
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
        status: { in: ["completed", "partial"] },
      },
      select: { videoId: true },
    })
  ).forEach((v) => v.videoId && completedVodsMap.set(v.videoId, true));

  console.log("CHANNEL PROCESS QUEUE:", newQueue.id);

  const from = limitToPreviousDate
    ? (
        await ctx.prisma.channelStats.findFirst({
          where: { channelId },
          orderBy: { processedTo: "desc" },
        })
      )?.processedTo
    : undefined;

  let videosTab: Channel | ChannelListContinuation = await channel.getVideos();
  let allVods: Video[] = [];
  type VideoWithVideoInfo = Video & { videoInfo: VideoInfo };
  let filteredVods: (Video | VideoWithVideoInfo)[] = [];
  let processMore = true;
  let page = 0;
  const start = performance.now();
  while (
    (page === 0 || videosTab.has_continuation) &&
    processMore &&
    (maxPages ? page < maxPages : true)
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
    if (continuation) {
      console.log("assign continuation");
      videosTab = continuation;
    }
    if (videos.length > 0) {
      allVods = [...allVods, ...videos];
      filteredVods = [...filteredVods, ...videos].filter(
        (v) => completedVodsMap.get(v.id) !== true
      );
    }
    const lastVod = filteredVods?.[filteredVods.length - 1];
    let lastVideoDateString: string | undefined;
    if (from && lastVod) {
      const lastVidInfo = await getVideoInfo({ videoID: lastVod.id });
      lastVideoDateString = lastVidInfo?.primary_info?.published?.text;
    }
    if (
      (maxVideos && filteredVods.length >= maxVideos) ||
      (limitToPreviousDate &&
        from &&
        lastVideoDateString &&
        from >= new Date(Date.parse(lastVideoDateString)))
    ) {
      processMore = false;
    }
    page += 1;
  }
  const endFetch = performance.now();

  filteredVods = filteredVods.slice(0, maxVideos > 0 ? maxVideos : undefined);

  if (limitToPreviousDate && from) {
    await Promise.allSettled(
      filteredVods.map(async (v, i) => {
        const videoInfo = await getVideoInfo({ videoID: v.id });
        filteredVods[i] = {
          ...(v as Video),
          videoInfo: videoInfo as VideoInfo,
        } as VideoWithVideoInfo;
      })
    );
    filteredVods = filteredVods.filter((v) => {
      const publishedText = (v as VideoWithVideoInfo)?.videoInfo?.primary_info
        ?.published.text;
      return publishedText && from <= new Date(Date.parse(publishedText));
    });
  }

  const botId = (await ctx.prisma.bots.findFirst())?.id;
  const spawnProcesses = await Promise.allSettled(
    filteredVods.map((v) =>
      spawnVideoProcess({
        videoId: v.id,
        channelId: channelId,
        queueId: newQueue.id,
        skipAnnotations: true,
        botId,
        videoInfo: (v as VideoWithVideoInfo)?.videoInfo,
      })
    )
  );

  if (filteredVods.length > 0) {
    spawnAnnotateChannelVideosProcess({ channelId, queueId: newQueue.id });
    await ctx.prisma.processQueue.update({
      where: { id: newQueue.id },
      data: {
        status: "partial",
        lastUpdated: new Date(),
      },
    });
  } else {
    await ctx.prisma.$transaction(async (tx) => {
      const pendingVods = await tx.processQueue.findMany({
        where: {
          channelId,
          videoId: { not: "" },
          type: "video",
          status: { in: ["partial", "pending"] },
        },
        select: { id: true },
      });
      if (pendingVods.length > 0) {
        spawnAnnotateChannelVideosProcess({ channelId, queueId: newQueue.id });
      }
      await tx.processQueue.update({
        where: { id: newQueue.id },
        data: {
          status: pendingVods.length > 0 ? "partial" : "completed",
          lastUpdated: new Date(),
        },
      });
    });
  }

  const endServerCall = performance.now();
  console.log("VODS PROCESSSED?", {
    timeToFetch: endFetch - start,
    timeToSend: endServerCall - endFetch,
    pages: page,
    allvods: allVods.length,
    filtered: filteredVods.length,
    completed: completedVodsMap.size,
    limitToPreviousDate,
    from,
    errored: spawnProcesses?.filter((s) => s.status === "rejected")?.length,
  });
};

const spawnVideoProcess = async (input: {
  videoId: string;
  channelId: string;
  queueId?: string;
  skipAnnotations?: boolean;
  botId?: string;
  videoInfo?: VideoInfo;
}) => {
  const JSONdata = JSON.stringify(input);
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: SECRET },
    body: JSONdata,
  };
  //console.log("call", input.videoId, input.channelId);
  const res = await fetch(`${SERVER_URL}/api/process/video`, options); //
  //console.log("res?", input.videoId, res.status);
  return;
};

export const spawnAnnotateChannelVideosProcess = async (input: {
  channelId: string;
  queueId?: string;
  continueQueue?: boolean;
}) => {
  const JSONdata = JSON.stringify(input);
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: SECRET },
    body: JSONdata,
  };
  console.log("call annotate videos", input.channelId);
  const res = await fetch(
    `${SERVER_URL}/api/process/channel-segments`,
    options
  ); //
  console.log("res?");
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

export const processAllSegments = async ({ ctx }: { ctx: Context }) => {
  const prisma = ctx.prisma;
  const allVodsProcessing = new Set<string>();
  const successedVods = new Set<string>();
  const RATELIMIT_PER_MINUTE = 20;

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const completeVideoQueue = async (videoId: string, errored = false) => {
    await prisma.processQueue.updateMany({
      where: {
        videoId: videoId,
        type: "video",
      },
      data: {
        status: errored ? "error" : "completed",
        lastUpdated: new Date(),
      },
    });
  };

  async function rateLimitedVideoProcess(
    botId: string,
    parentProcessId: string,
    videos: string[]
  ) {
    const vodQueue = await prisma.processQueue.findMany({
      where: {
        type: "video",
        videoId: { in: videos },
        status: { in: ["completed", "partial", "pending"] },
      },
    });
    const vodQueueSet = new Set<string>();
    vodQueue.forEach((v) => vodQueueSet.add(v.videoId ?? ""));

    const vodsToProcess = videos.filter((v) => !vodQueueSet.has(v));
    console.log(
      "SKIPPING",
      vodQueueSet.size,
      "PROCESSING",
      vodsToProcess.length
    );

    await Promise.allSettled(
      vodsToProcess.map(async (videoId, index) => {
        await sleep(index * (1000 * (60 / RATELIMIT_PER_MINUTE)));
        let errored = false;
        try {
          console.log("process", videoId);
          const videoInfo = await getVideoInfo({ videoID: videoId });
          await prisma.processQueue.upsert({
            where: {
              channelId_videoId_type: {
                channelId: videoInfo?.basic_info.channel?.id ?? "",
                videoId,
                type: "video",
              },
            },
            create: {
              status: "pending",
              videoId: videoId,
              channelId: videoInfo?.basic_info.channel?.id ?? "",
              parentProcessId,
              type: "video",
              timeInitialized: new Date(),
            },
            update: {
              status: "pending",
              parentProcessId,
              timeInitialized: new Date(),
            },
          });
          await processVideo({
            videoId,
            botId,
            queueId: parentProcessId,
            suppliedVideoInfo: videoInfo,
            channelId: videoInfo?.basic_info.channel?.id,
            ctx: { prisma, session: null },
          });
        } catch (err) {
          if (
            !(err instanceof TRPCError) ||
            (err instanceof TRPCError &&
              err.cause instanceof CustomError &&
              err.cause.level === "COMPLETE")
          ) {
            console.log("video err", err);
            errored = true;
          }
        } finally {
          successedVods.add(videoId);
          await completeVideoQueue(videoId, errored);
        }
      })
    );
  }

  (async () => {
    const start = new Date();
    const botId = (await prisma.bots.findFirst())?.id;
    let errored = false;
    if (!botId) {
      console.error("no bot found");
    }

    const parentQueue = await prisma.processQueue.upsert({
      where: {
        channelId_videoId_type: {
          channelId: "",
          videoId: "",
          type: "bulk_process",
        },
      },
      create: {
        status: "pending",
        type: "bulk_process",
        timeInitialized: new Date(),
      },
      update: {
        status: "pending",
        type: "bulk_process",
        timeInitialized: new Date(),
      },
    });

    let skip = 0;
    let done = false;
    try {
      while (!done && skip < 15000) {
        const sponsorTimes = await prisma.sponsorTimes.groupBy({
          by: ["videoID", "timeSubmitted"],
          orderBy: {
            timeSubmitted: "desc",
          },
          where: {
            category: "sponsor",
            locked: true,
          },
          take: 100,
          skip,
        });
        skip += sponsorTimes.length;

        if (!sponsorTimes || !(sponsorTimes.length > 0)) {
          done = true;
        }

        const vodsInProcessSegment = new Set<string>();
        for (let i = 0; i < sponsorTimes.length; i++) {
          if (!allVodsProcessing.has(sponsorTimes[i]?.videoID ?? "")) {
            allVodsProcessing.add(sponsorTimes[i]?.videoID ?? "");
            vodsInProcessSegment.add(sponsorTimes[i]?.videoID ?? "");
          }
        }
        console.log("PROCESS", vodsInProcessSegment.size);
        await rateLimitedVideoProcess(
          botId as string,
          parentQueue.id,
          Array.from(vodsInProcessSegment)
        );
      }
    } catch (error) {
      errored = true;
      console.log("error:", error);
    } finally {
      await prisma.processQueue.update({
        where: { id: parentQueue.id },
        data: {
          status: errored ? "error" : "completed",
          lastUpdated: new Date(),
        },
      });
      console.log(`process done. Started: ${start}, ended: ${new Date()}`);
      console.log("total vods:", allVodsProcessing.size);
      console.log("vods successfull:", successedVods.size);
      const failed = new Set(
        [...allVodsProcessing].filter((x) => !successedVods.has(x))
      );

      console.log("failed vods", failed, failed.size);
    }
  })();
};
