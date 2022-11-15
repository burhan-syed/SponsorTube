import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { getChannel } from "../../../apis/youtube";

import RichItem from "youtubei.js/dist/src/parser/classes/RichItem";
import Video from "youtubei.js/dist/src/parser/classes/Video";
import type RichGrid from "youtubei.js/dist/src/parser/classes/RichGrid";
import type C4TabbedHeader from "youtubei.js/dist/src/parser/classes/C4TabbedHeader";

export const channelRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  details: publicProcedure
    .input(z.object({ channelID: z.string() }))
    .query(async ({ input }) => {
      const channel = await getChannel({ channelID: input.channelID });
      const videosTab = await channel.getVideos();
      const richItems = (
        videosTab.current_tab?.content as RichGrid
      ).contents.filterType(RichItem);
      const videos = richItems
        .filter((richItem) => richItem.content?.is(Video))
        .map((richItem) => richItem.content);
      return {
        channelHeader: channel.header as C4TabbedHeader,
        channelVideos: videos as Video[],
      };
    }),
});
