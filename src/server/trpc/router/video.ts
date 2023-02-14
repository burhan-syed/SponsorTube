import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { getXMLCaptions } from "../../functions/captions";
import { getVideoInfo } from "../../../apis/youtube";
import { getSegmentsByID } from "@/apis/sponsorblock";
import { TRPCError } from "@trpc/server";
import { updateVideoSponsorsFromDB } from "@/server/db/sponsors";
import CompactVideo from "youtubei.js/dist/src/parser/classes/CompactVideo";
import { SaveVideoDetails, SaveVideoDetailsSchema } from "@/server/db/videos";

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
    .input(SaveVideoDetailsSchema)
    .mutation(async ({ input, ctx }) => {
      await SaveVideoDetails({ input, ctx });
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
