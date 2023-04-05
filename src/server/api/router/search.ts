import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { ytAutoComplete, ytSearchQuery } from "../../../apis/youtube";
import { YTNodes } from "youtubei.js/agnostic";
import { InnerTubeVideoToVideoCard } from "@/server/transformers/transformer";

export const searchRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  ytSearch: publicProcedure
    .input(z.object({ searchQuery: z.string() }))
    .query(async ({ input }) => {
      const queryResults = await ytSearchQuery({ query: input.searchQuery });
      const queryResultVideos = queryResults?.videos
        ?.filterType(YTNodes.Video)
        .map((v) => {
          return InnerTubeVideoToVideoCard(v);
        });

      const queryResultChannels = queryResults?.channels?.filterType(
        YTNodes.Channel
      );
      return {
        videos: queryResultVideos,
        channels: queryResultChannels,
      };
    }),
  ytAutoComplete: publicProcedure
    .input(z.object({ searchQuery: z.string() }))
    .query(async ({ input }) => {
      const results = await ytAutoComplete({ query: input.searchQuery });
      return {
        results,
      };
    }),
});
