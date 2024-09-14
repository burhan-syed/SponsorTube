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
  processAllChannels,
  processChannel,
  summarizeAllChannels,
} from "@/server/functions/process";
import C4TabbedHeader from "youtubei.js/dist/src/parser/classes/C4TabbedHeader";
import { TRPCError } from "@trpc/server";
import { summarizeChannelSponsors } from "@/server/db/sponsors";
import { transformInnerTubeVideoToVideoCard } from "@/server/transformers/transformer";
import { ChannelHeaderInfo } from "@/types/schemas";
import { CustomError } from "@/server/common/errors";
import {
  DecoratedAvatarView,
  DescriptionPreviewView,
  ImageBannerView,
  PageHeader,
} from "youtubei.js/dist/src/parser/nodes";

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
      // console.log("channel?", channel?.title);
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
      // console.log("videos?", videos.length, hasNext, nextCursor);
      const transformedVideos = videos.map((v) =>
        transformInnerTubeVideoToVideoCard(v)
      );
      // console.log("transformedVideos", transformedVideos.length);
      const header = channel.header;
      // console.log("header?", channel.metadata);
      let transformedHeader: ChannelHeaderInfo;
      // if (channel.metadata && channel.metadata.title) {
      //   transformedHeader = {
      //     id: input.channelID,
      //     name: channel.metadata.title,
      //     thumbnail: channel.metadata.thumbnail?.[0],
      //     shortDescription: channel.metadata?.description,
      //   };
      // }
      if (header?.type === "C4TabbedHeader") {
        const c4Header = header as C4TabbedHeader;
        transformedHeader = {
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
      } else if (header?.type === "PageHeader") {
        const pageHeader = header as PageHeader;
        const avatar = (pageHeader.content?.image as DecoratedAvatarView)
          ?.avatar?.image?.[0];
        const metadata = pageHeader.content?.metadata?.metadata_rows;
        transformedHeader = {
          id: input.channelID,
          name: pageHeader.page_title,
          isVerified: undefined,
          thumbnail: avatar
            ? { url: avatar.url, height: avatar.height, width: avatar.width }
            : undefined,
          shortDescription: (
            pageHeader.content?.description as DescriptionPreviewView
          )?.description?.text,
          subscriberCountText: metadata?.[1]?.metadata_parts?.[0]?.text?.text,
          videoCountText: metadata?.[2]?.metadata_parts?.[0]?.text?.text,
          handle: metadata?.[0]?.metadata_parts?.[0]?.text?.text,
          banner: (pageHeader.content?.banner as ImageBannerView)?.image?.[0],
        };
      } else {
        transformedHeader = {
          id: input.channelID,
          name: channel.metadata.title ?? "",
        };
      }

      return {
        channelInfo: transformedHeader,
        channelVideos: transformedVideos,
        hasNext: hasNext,
        nextCursor: nextCursor,
      };
    }),
  processChannel: protectedProcedure
    .input(z.object({ channelID: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await processChannel({ channelId: input.channelID, ctx });
    }),
  updateChannelSponsors: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const summarizeResult = await summarizeChannelSponsors({
        channelId: input.channelId,
        ctx,
      });
      if (summarizeResult instanceof CustomError) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          cause: summarizeResult,
        });
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
        cursor: z.number().nullish(),
        limit: z.number().min(1).max(25).nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 12;
      const cursor = input.cursor;
      const groupedSponsors = await ctx.prisma.sponsors.groupBy({
        by: ["brand", "date"],
        where: { Video: { channelId: input.channelId } },
        orderBy: { date: "desc" },
        skip: cursor ? cursor : undefined,
        take: limit + 1,
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (groupedSponsors.length > limit) {
        const last = groupedSponsors.pop();
        nextCursor = (cursor ?? 0) + limit;
      }
      return {
        sponsors: groupedSponsors,
        nextCursor,
      };
    }),
  summarizeAllChannels: adminProcedure.mutation(async ({ ctx }) => {
    if (process.env.NODE_ENV !== "development") {
      throw new TRPCError({ code: "FORBIDDEN", message: "only run locally" });
    }
    await summarizeAllChannels({ ctx });
  }),
  processAllChannels: adminProcedure.mutation(async ({ ctx }) => {
    if (process.env.NODE_ENV !== "development") {
      throw new TRPCError({ code: "FORBIDDEN", message: "only run locally" });
    }
    await processAllChannels({ ctx });
  }),
});
