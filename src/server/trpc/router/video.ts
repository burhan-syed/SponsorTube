import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { getXMLCaptions } from "../../functions/captions";
import { getVideoInfo } from "../../../apis/youtube";

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
        }
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
      };
    }),
  saveDetails: publicProcedure
    .input(
      z.object({
        segments: z.array(
          z.object({
            UUID: z.string(),
            startTime: z.number(),
            endTime: z.number(),
            category: z.string(),
          })
        ),
        basic_info: z.object({
          videoID: z.string(),
          videoTitle: z.string(),
          videoDuration: z.number(),
          videoViewCount: z.number(),
          videoKeywords: z.array(z.string()).nullable(),
          videoDescription: z.string(),
          videoThumbnails: z
            .array(
              z.object({
                url: z.string(),
                width: z.number(),
                height: z.number(),
              })
            )
            .nullable(),
          videoEmbed: z.object({
            iframe_url: z.string(),
            height: z.number(),
            width: z.number(),
          }),
          channel: z
            .object({
              id: z.string(),
              name: z.string(),
              url: z.string(),
            })
            .nullable(),
        }),
        captions: z.object({
          caption_tracks: z.array(
            z.object({
              base_url: z.string(),
              vss_id: z.string().nullable(),
              language_code: z.string(),
            })
          ),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return "hello";
    }),
  testMutate: publicProcedure
    .input(z.object({ captionURL: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await getXMLCaptions(input.captionURL);
    }),
});
