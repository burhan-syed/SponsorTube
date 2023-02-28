import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { getChannel, getVideoInfo } from "../../../apis/youtube";

import RichItem from "youtubei.js/dist/src/parser/classes/RichItem";
import Video from "youtubei.js/dist/src/parser/classes/Video";
import type RichGrid from "youtubei.js/dist/src/parser/classes/RichGrid";
import type C4TabbedHeader from "youtubei.js/dist/src/parser/classes/C4TabbedHeader";
import type { YTNode } from "youtubei.js/dist/src/parser/helpers";
import { getVideosContinuation } from "@/server/functions/channel";
import { processChannel } from "@/server/functions/process";

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
      const videosTab = await channel.getVideos();

      const { videos, hasNext, nextCursor } = await getVideosContinuation({
        videosTab,
        cursor: input.cursor,
      });
      const fv = videos?.[0];
      const lv = videos?.[videos?.length - 1];
      console.log({
        fvpub: fv?.published.text,
        fvtitle: fv?.title.text,
        lvpub: lv?.published.text,
        lvtitle: lv?.title.text,
        cursor: input.cursor,
        nextCursor,
      });

      return {
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
});
