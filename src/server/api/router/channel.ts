import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc";
import { z } from "zod";
import { getChannel } from "../../../apis/youtube";
import { getVideosContinuation } from "@/server/functions/channel";
import {
  processChannel,
  summarizeAllChannels,
} from "@/server/functions/process";
import C4TabbedHeader from "youtubei.js/dist/src/parser/classes/C4TabbedHeader";
import { TRPCError } from "@trpc/server";
import { summarizeChannelSponsors } from "@/server/db/sponsors";
import { transformInnerTubeVideoToVideoCard } from "@/server/transformers/transformer";
import { ChannelHeaderInfo } from "@/types/schemas";
import { CustomError } from "@/server/common/errors";

export const channelRouter = createTRPCRouter({
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
      //console.log("channel?", channel);
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

      const transformedVideos = videos.map((v) =>
        transformInnerTubeVideoToVideoCard(v)
      );
      const c4Header = channel.header as C4TabbedHeader;
      const transformedHeader: ChannelHeaderInfo = {
        id: c4Header.author.id,
        name: c4Header.author.name,
        isVerified: c4Header.author.is_verified ?? undefined,
        thumbnail: c4Header.author.thumbnails?.[0]?.url
          ? {
              url: c4Header.author.thumbnails?.[0]?.url,
              height: c4Header.author.thumbnails[0]?.height,
              width: c4Header.author.thumbnails[0]?.width,
            }
          : undefined,
        shortDescription: channel.metadata.description,
        subscriberCountText: c4Header?.subscribers?.text,
        videoCountText: c4Header?.videos_count?.text,
        handle: c4Header.channel_handle?.text,
        banner: c4Header.banner?.[0]?.url
          ? {
              url: c4Header.banner[0].url,
              height: c4Header.banner[0]?.height,
              width: c4Header.banner[0]?.width,
            }
          : undefined,
      };
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
        channelInfo: transformedHeader,
        channelVideos: transformedVideos,
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
      const summarizeResult = await summarizeChannelSponsors({ channelId: input.channelId, ctx });
      if(summarizeResult instanceof CustomError){
        throw new TRPCError({code: "TOO_MANY_REQUESTS", cause: summarizeResult})
      }
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
    .input(
      z.object({
        channelId: z.string(),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(25).nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 12;
      const cursor = input.cursor;
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
        take: limit + 1,
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (channelSponsors.length > limit) {
        const last = channelSponsors.pop();
        nextCursor = last?.id;
      }
      return {
        sponsors: channelSponsors,
        nextCursor,
      };
    }),
  summarizeAllChannels: adminProcedure.mutation(async ({ ctx }) => {
    await summarizeAllChannels({ ctx });
  }),
});
