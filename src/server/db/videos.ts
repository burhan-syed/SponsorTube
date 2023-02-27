import { z } from "zod";

import type { Context } from "../trpc/context";
import { getSegmentsByID } from "@/apis/sponsorblock";
import { getVideoInfo } from "@/apis/youtube";
import { TRPCError } from "@trpc/server";

import CompactVideo from "youtubei.js/dist/src/parser/classes/CompactVideo";

export const SaveVideoDetailsSchema = z.object({
  segmentIDs: z.array(z.string()),
  videoId: z.string(),
});

export const GetVideoInfoSchema = z.object({ videoID: z.string() });

type SaveVideoDetailsType = z.infer<typeof SaveVideoDetailsSchema>;
type GetVideoInfoType = z.infer<typeof GetVideoInfoSchema>;

export const saveVideoDetails = async ({
  input,
  ctx,
}: {
  input: SaveVideoDetailsType;
  ctx: Context;
}) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const [segmentInfos, videoInfo] = await Promise.all([
    getSegmentsByID({
      userID: ctx.session.user.id,
      UUIDs: input.segmentIDs,
    }),
    getVideoInfo({ videoID: input.videoId }),
  ]);

  await videoUpsertWithRetry(0);

  //deadlock workaround
  async function videoUpsertWithRetry(retryCount = 0) {
    if (retryCount > 2) {
      throw new Error(`VIDEO UPSERT FAILED ${input.videoId}`);
      return;
    }
    try {
      console.log("try video upsert", retryCount);
      await videoUpsert();
    } catch (err) {
      console.log("video upsert err", retryCount, err);
      if (retryCount < 5) {
        await videoUpsertWithRetry(++retryCount);
      }
    }
  }

  async function videoUpsert() {
    if (
      !videoInfo.basic_info.channel?.id ||
      !videoInfo.basic_info.channel?.name
    ) {
      throw new TRPCError({
        message: "Videos must contain channel information",
        code: "PRECONDITION_FAILED",
      });
    }

    await ctx.prisma.videos.upsert({
      where: { id: input.videoId },
      update: {
        SponsorSegments: {
          connectOrCreate: segmentInfos.map((segment) => ({
            where: { UUID: segment.UUID },
            create: {
              // ...segment,
              UUID: segment.UUID,
              category: segment.category,
              startTime: segment.startTime,
              endTime: segment.endTime,
              votes: segment.votes,
              locked: !!segment.locked,
              userID: segment.userID,
              timeSubmitted: new Date(segment.timeSubmitted),
              views: segment.views,
              hidden: !!segment.hidden,
              shadowHidden: !!segment.shadowHidden,
            },
          })),
        },
      },
      create: {
        id: input.videoId,
        title: videoInfo.basic_info.title,
        published: videoInfo.primary_info?.published.text
          ? new Date(Date.parse(videoInfo.primary_info?.published.text))
          : undefined,
        duration: videoInfo.basic_info.duration,
        thumbnail: videoInfo.basic_info.thumbnail?.[0]?.url?.split("?")?.[0],
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
        SponsorSegments: {
          connectOrCreate: segmentInfos.map((segment) => ({
            where: { UUID: segment.UUID },
            create: {
              // ...segment,
              UUID: segment.UUID,
              category: segment.category,
              startTime: segment.startTime,
              endTime: segment.endTime,
              votes: segment.votes,
              locked: !!segment.locked,
              userID: segment.userID,
              timeSubmitted: new Date(segment.timeSubmitted),
              views: segment.views,
              hidden: !!segment.hidden,
              shadowHidden: !!segment.shadowHidden,
            },
          })),
        },
      },
    });
  }
};

export const getVideoInfoFormatted = async ({
  input,
}: {
  input: GetVideoInfoType;
}) => {
  const videoInfo = await getVideoInfo({ videoID: input.videoID });
  return {
    basic_info: {
      ...videoInfo.basic_info,
      description: videoInfo.secondary_info?.description,
      upload_date: videoInfo.primary_info?.published.text,
      channel: {
        ...videoInfo.basic_info.channel,
        subscriber_count:
          videoInfo.secondary_info?.owner?.subscriber_count.text,
        thumbnail:
          videoInfo.secondary_info?.owner?.author.thumbnails.pop()?.url,
        is_verified:
          videoInfo.secondary_info?.owner?.author.is_verified ?? false,
        is_verified_artist:
          videoInfo.secondary_info?.owner?.author.is_verified_artist ?? false,
      },
    },
    captions: { ...videoInfo.captions },
    watch_next: videoInfo.watch_next_feed?.filterType(CompactVideo),
  };
};
