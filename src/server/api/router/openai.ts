import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

import {
  GetSegmentAnnotationsSchema,
  getSegmentAnnotationsOpenAICall,
} from "@/server/db/bots";

export const openAIRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getSegmentAnnotations: publicProcedure
    .input(GetSegmentAnnotationsSchema)
    .mutation(async ({ ctx, input }) => {
      const stopAt = new Date(new Date().getTime() + 1000 * 30); //30sec timeout
      return await getSegmentAnnotationsOpenAICall({
        input: input,
        ctx: ctx,
        stopAt,
      });
    }),
});
