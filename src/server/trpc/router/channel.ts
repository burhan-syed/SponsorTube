import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { getChannel } from "../../../apis/youtube";

import RichItem from "youtubei.js/dist/src/parser/classes/RichItem";
import Video from "youtubei.js/dist/src/parser/classes/Video";
import type RichGrid from "youtubei.js/dist/src/parser/classes/RichGrid";
import type C4TabbedHeader from "youtubei.js/dist/src/parser/classes/C4TabbedHeader";
import type { YTNode } from "youtubei.js/dist/src/parser/helpers";

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
      let hasNext = false;
      const channel = await getChannel({ channelID: input.channelID });
      const videosTab = await channel.getVideos();
      const richItems = (
        videosTab.current_tab?.content as RichGrid
      ).contents.filterType(RichItem);
      let videos = richItems
        .filter((richItem) => richItem.content?.is(Video))
        .map((richItem) => richItem.content);
      hasNext = videosTab.has_continuation;
      if ((input?.cursor ?? 0) > 0) {
        let continuation = await videosTab.getContinuation();

        for (let i = 1; i < (input?.cursor ?? 0); i++) {
          if ((input?.cursor ?? -1) > i) {
            continuation = await continuation.getContinuation();
          }
        }
        hasNext = continuation.has_continuation;
        videos = continuation.contents?.contents
          ?.filterType(RichItem)
          .filter((richItem) => richItem.content?.is(Video))
          .map((richItem) => richItem.content) as (YTNode | null)[];
      }

      return {
        channelHeader: channel.header as C4TabbedHeader,
        channelVideos: videos as Video[],
        hasNext: hasNext,
        nextCursor: (input?.cursor ?? 0) + 1,
      };
    }),
});
