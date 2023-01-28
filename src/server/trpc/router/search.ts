import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { ytAutoComplete, ytSearchQuery } from "../../../apis/youtube";
import Channel from "youtubei.js/dist/src/parser/classes/Channel";
import Video from "youtubei.js/dist/src/parser/classes/Video";

export const searchRouter = router({
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
        ?.filterType(Video)
        .map((v) => ({
          ...v,
          //'thumbnails' property is not appearing on client...? Workaround:
          video_thumbnail: v.thumbnails?.[0],
        }));

      const queryResultChannels = queryResults?.channels?.filterType(Channel);
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
