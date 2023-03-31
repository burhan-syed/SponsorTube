import { z } from "zod";
import { Prisma } from "@prisma/client";
import type { Context } from "../trpc/context";
import { getSegmentsByID } from "@/apis/sponsorblock";
import { getVideoInfo } from "@/apis/youtube";
import { TRPCError } from "@trpc/server";
import { YTNodes } from "youtubei.js/agnostic";
import type VideoInfo from "youtubei.js/dist/src/parser/youtube/VideoInfo";

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
  inputVideoInfo,
}: {
  input: SaveVideoDetailsType;
  ctx: Context;
  inputVideoInfo?: VideoInfo;
}) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const [segmentInfos, videoInfo] = await Promise.all([
    getSegmentsByID({
      userID: ctx.session.user.id,
      UUIDs: input.segmentIDs,
    }),
    inputVideoInfo ? inputVideoInfo : getVideoInfo({ videoID: input.videoId }),
  ]);

  if (!videoInfo) {
    throw new Error(`Could not find video information for ${input.videoId}`);
  }

  await videoUpsert();

  async function videoUpsert() {
    console.log("try video upsert", input.videoId);

    if (
      !videoInfo?.basic_info.channel?.id ||
      !videoInfo?.basic_info.channel?.name
    ) {
      throw new TRPCError({
        message: "Videos must contain channel information",
        code: "PRECONDITION_FAILED",
      });
    }

    if (!videoInfo.primary_info?.published.text) {
      throw new TRPCError({
        message: "Videos must have a published date",
        code: "PRECONDITION_FAILED",
      });
    }

    const segmentsCreateData = segmentInfos?.map((segment) => ({
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
    }));

    let videoChannelIsMarkedWithSponsors = false;

    try {
      const vodUpsert = await ctx.prisma.videos.upsert({
        where: { id: input.videoId },
        update: {
          SponsorSegments: {
            connectOrCreate: segmentsCreateData?.map((s) => ({
              where: { UUID: s.UUID },
              create: { ...s },
            })),
          },
        },
        create: {
          id: input.videoId,
          title: videoInfo.basic_info.title,
          published: new Date(
            Date.parse(videoInfo.primary_info?.published.text)
          ),
          duration: videoInfo.basic_info.duration,
          thumbnail: videoInfo.basic_info.thumbnail?.[0]?.url?.split("?")?.[0],
          thumbnailHeight: videoInfo.basic_info.thumbnail?.[0]?.height,
          thumbnailWidth: videoInfo.basic_info.thumbnail?.[0]?.width,
          Channel: {
            connectOrCreate: {
              where: { id: videoInfo.basic_info.channel.id },
              create: {
                id: videoInfo.basic_info.channel.id,
                name: videoInfo.basic_info.channel?.name,
                hasSponsors:
                  segmentInfos && segmentInfos?.length > 0 ? true : undefined,
              },
            },
          },
          SponsorSegments: {
            connectOrCreate: segmentsCreateData?.map((s) => ({
              where: { UUID: s.UUID },
              create: { ...s },
            })),
          },
        },
        include: {
          Channel: true,
        },
      });
      if (vodUpsert.Channel.hasSponsors) {
        videoChannelIsMarkedWithSponsors = true;
      }
    } catch (err) {
      //in the event of a deadlock the video information is already being written, just save the segments instead.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2034" &&
        segmentsCreateData
      ) {
        await ctx.prisma.sponsorTimes.createMany({
          data: segmentsCreateData.map((data) => ({
            ...data,
            videoID: input.videoId,
          })),
        });
      } else {
        throw err;
      }
    }
    //update channel if a video has sponsors and channel not already marked
    try {
      if (
        !videoChannelIsMarkedWithSponsors &&
        segmentInfos &&
        segmentInfos.length > 0
      ) {
        await ctx.prisma.channels.update({
          where: { id: videoInfo.basic_info.channel.id },
          data: { hasSponsors: true },
        });
      }
    } catch (err) {}
  }
};

export const getVideoInfoFormatted = async ({
  input,
}: {
  input: GetVideoInfoType;
}) => {
  const videoInfo = await getVideoInfo({ videoID: input.videoID });
  if (!videoInfo) {
    return;
  }
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
    watch_next: videoInfo.watch_next_feed?.filterType(YTNodes.CompactVideo),
  };
};
