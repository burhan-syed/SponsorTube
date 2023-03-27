import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { getChannel } from "../../../apis/youtube";
import { getVideosContinuation } from "@/server/functions/channel";
import { processChannel } from "@/server/functions/process";
import type C4TabbedHeader from "youtubei.js/dist/src/parser/classes/C4TabbedHeader";
import { TRPCError } from "@trpc/server";
import { summarizeChannelSponsors } from "@/server/db/sponsors";

export const channelRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  details: publicProcedure
    .input(z.object({ channelID: z.string(), cursor: z.number().nullish() }))
    .query(async ({ input }) => {
      //let hasNext = false;
      const channel = await getChannel({ channelID: input.channelID });
      console.log("channel?", channel);
      if (!channel) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Could not load channel id ${input.channelID}`,
        });
      }
      const videosTab = await channel.getVideos();

      const { videos, hasNext, nextCursor } = await getVideosContinuation({
        videosTab,
        cursor: input.cursor,
      });
      // const fv = videos?.[0];
      // const lv = videos?.[videos?.length - 1];
      // console.log({
      //   fvpub: fv?.published.text,
      //   fvtitle: fv?.title.text,
      //   lvpub: lv?.published.text,
      //   lvtitle: lv?.title.text,
      //   cursor: input.cursor,
      //   nextCursor,
      // });

      return {
        metadata: { description: channel.metadata.description },
        channelHeader: channel.header as C4TabbedHeader,
        channelVideos: videos,
        hasNext: hasNext,
        nextCursor: nextCursor,
      };
    }),
  processChannel: publicProcedure
    .input(z.object({ channelID: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await processChannel({ channelId: input.channelID, ctx });
    }),
  updateChannelSponsors: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await summarizeChannelSponsors({ channelId: input.channelId, ctx });
    }),
  getStats: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input, ctx }) => {
      const channelStats = await ctx.prisma.channelStats.findMany({
        where: { channelId: input.channelId },
        orderBy: { processedTo: "desc" },
      });
      return channelStats;
    }),
  getVideosStatus: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input, ctx }) => {
      const processStatus = await ctx.prisma.processQueue.findFirst({
        where: { channelId: input.channelId, type: "channel_videos" },
      });
      return processStatus;
    }),

  getSponsors: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input, ctx }) => {
      const channelSponsors = await ctx.prisma.sponsors.findMany({
        where: { Video: { channelId: input.channelId } },
        include: {
          Video: {
            select: {
              published: true,
            },
          },
        },
        orderBy: {
          Video: {
            published: "desc",
          },
        },
      });
      return channelSponsors;
    }),
});
