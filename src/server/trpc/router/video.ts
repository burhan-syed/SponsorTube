import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { getXMLCaptions } from "../../functions/captions";
import { getVideoInfo } from "../../../apis/youtube";
import { getSegmentsByID } from "@/apis/sponsorblock";
import { TRPCError } from "@trpc/server";
import { updateVideoSponsorsFromDB } from "@/server/functions/db/sponsors";
import CompactVideo from "youtubei.js/dist/src/parser/classes/CompactVideo";

export const videoRouter = router({
  segments: publicProcedure
    .input(z.object({ videoID: z.string() }))
    .query(async ({ input, ctx }) => {
      const videoSegments = await ctx.prisma.sponsorTimes.findMany({
        where: { videoID: input.videoID, locked: true },
        select: {
          UUID: true,
          videoID: true,
          startTime: true,
          endTime: true,
          category: true,
          videoDuration: true,
        },
      });
      return videoSegments;
    }),
  info: publicProcedure
    .input(z.object({ videoID: z.string() }))
    .query(async ({ input }) => {
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
              videoInfo.secondary_info?.owner?.author.is_verified_artist ??
              false,
          },
        },
        captions: { ...videoInfo.captions },
        watch_next: videoInfo.watch_next_feed?.filterType(CompactVideo),
      };
    }),
  saveDetails: protectedProcedure
    .input(
      z.object({
        segmentIDs: z.array(z.string()),
        videoId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [segmentInfos, videoInfo] = await Promise.all([
        getSegmentsByID({
          userID: ctx.session.user.id,
          UUIDs: input.segmentIDs,
        }),
        getVideoInfo({ videoID: input.videoId }),
      ]);

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
    }),
  updateSponsors: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await updateVideoSponsorsFromDB({ videoId: input.videoId });
    }),
  getSponsors: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.sponsors.findMany({
        where: { videoId: input.videoId },
      });
    }),
  testMutate: publicProcedure
    .input(z.object({ videoID: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log("test:", input.videoID);
    }),
});
