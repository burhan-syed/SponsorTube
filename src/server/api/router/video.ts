import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc";
import { z } from "zod";
import {
  compareAndUpdateVideoSponsors,
  getVideoSponsors,
  updateVideoSponsorsFromDB,
} from "@/server/db/sponsors";
import {
  saveVideoDetails,
  SaveVideoDetailsSchema,
  getVideoInfoFormatted,
  GetVideoInfoSchema,
} from "@/server/db/videos";
import { processAllSegments, processVideo } from "@/server/functions/process";
import { transformInnerTubeVideoToVideoCard } from "@/server/transformers/transformer";
import { VideoDetailsInfo } from "@/types/schemas";

export const videoRouter = createTRPCRouter({
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
    const formattedVideoInfo = await getVideoInfoFormatted({ input });
    const transformedVideoInfo: VideoDetailsInfo = {
      id: formattedVideoInfo?.basic_info?.id ?? input.videoID,
      title: formattedVideoInfo?.basic_info.title,
      viewCount: formattedVideoInfo?.basic_info.view_count,
      likeCount: formattedVideoInfo?.basic_info.like_count,
      shortDescription: formattedVideoInfo?.basic_info.short_description,
      description: formattedVideoInfo?.basic_info.description?.runs
        ? {
            runs: formattedVideoInfo?.basic_info.description?.runs.map(
              (r) => r.text
            ),
          }
        : undefined,
      publishedString: formattedVideoInfo?.basic_info.upload_date,
      captions: formattedVideoInfo?.captions.caption_tracks?.map((c) => ({
        url: c.base_url,
        languageCode: c.language_code,
      })),
      embed: formattedVideoInfo?.basic_info.embed?.iframe_url
        ? {
            url: formattedVideoInfo.basic_info.embed.iframe_url,
            height: formattedVideoInfo.basic_info.embed.height,
            width: formattedVideoInfo.basic_info.embed.width,
          }
        : undefined,
      author: {
        id:
          formattedVideoInfo?.basic_info.channel.id ??
          formattedVideoInfo?.basic_info.channel_id ??
          "",
        name: formattedVideoInfo?.basic_info.channel.name ?? "",
        isVerified: formattedVideoInfo?.basic_info.channel.is_verified,
        isVerifiedArtist:
          formattedVideoInfo?.basic_info.channel.is_verified_artist,
        thumbnail: formattedVideoInfo?.basic_info.channel.thumbnail
          ? {
              url: formattedVideoInfo.basic_info.channel.thumbnail,
            }
          : undefined,
        url: formattedVideoInfo?.basic_info.channel.url,
        subscriberCountText:
          formattedVideoInfo?.basic_info.channel.subscriber_count,
      },
      watchNextVideos: formattedVideoInfo?.watch_next?.map((v) =>
        transformInnerTubeVideoToVideoCard(v)
      ),
      duration: formattedVideoInfo?.basic_info.duration,
    };
    return transformedVideoInfo;
  }),
  saveDetails: protectedProcedure
    .input(SaveVideoDetailsSchema)
    .mutation(async ({ input, ctx }) => {
      await saveVideoDetails({ input, ctx });
    }),
  updateSponsors: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await updateVideoSponsorsFromDB({ videoId: input.videoId, ctx });
    }),
  getSponsors: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await getVideoSponsors({
        videoId: input.videoId,
        prisma: ctx.prisma,
      });
    }),
  processVideo: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const processResult = await processVideo({
        videoId: input.videoId,
        ctx,
      });
      await compareAndUpdateVideoSponsors({
        videoId: input.videoId,
        prisma: ctx.prisma,
      });
      return processResult;
    }),
  getVideoStatus: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input, ctx }) => {
      const processStatus = await ctx.prisma.processQueue.findFirst({
        where: { videoId: input.videoId, type: "video" },
      });
      return processStatus;
    }),
  processAll: adminProcedure.mutation(async ({ ctx }) => {
    await processAllSegments({ ctx });
  }),
  getRecent: publicProcedure
    .input(
      z.object({
        withSponsors: z.boolean().nullish(),
        limit: z.number().min(1).max(50).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 25;
      const { cursor } = input;
      const vods = await ctx.prisma.videos.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          published: "desc",
        },
        where: input.withSponsors
          ? {
              Sponsors: {
                some: {
                  id: {
                    not: undefined,
                  },
                },
              },
            }
          : undefined,
        include: {
          Channel: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (vods.length > limit) {
        const nextItem = vods.pop();
        nextCursor = nextItem?.id;
      }
      return {
        vods,
        nextCursor,
      };
    }),
  updateVideoSponsors: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await compareAndUpdateVideoSponsors({
        videoId: input.videoId,
        prisma: ctx.prisma,
      });
    }),
});
