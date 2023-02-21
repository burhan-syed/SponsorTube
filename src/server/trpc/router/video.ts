import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { updateVideoSponsorsFromDB } from "@/server/db/sponsors";
import {
  saveVideoDetails,
  SaveVideoDetailsSchema,
  getVideoInfoFormatted,
  GetVideoInfoSchema,
} from "@/server/db/videos";

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
  info: publicProcedure.input(GetVideoInfoSchema).query(async ({ input }) => {
    return await getVideoInfoFormatted({ input });
  }),
  saveDetails: protectedProcedure
    .input(SaveVideoDetailsSchema)
    .mutation(async ({ input, ctx }) => {
      await saveVideoDetails({ input, ctx });
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
