import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { OpenAIApi, Configuration } from "openai";

import { transcriptRouter } from "./transcripts";
import { AnnotationTags } from "@prisma/client";
import { textFindIndices } from "@/utils";
const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});

export const openAIRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getSegmentAnnotations: publicProcedure
    .input(
      z.object({
        segmentUUID: z.string(),
        transcriptId: z.string().nullish(),
        transcriptDetailsId: z.string().nullish(),
        transcript: z.string(),
        startTime: z.number().nullish(),
        endTime: z.number().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const openai = new OpenAIApi(configuration);
      const prompt = `Create a table to identify sponsor information if there is any in the following text:\n\"${input.transcript}"\n\nSponsor|Product|Offer|\n\n`;
      const response = await openai.createCompletion({
        model: "text-curie-001",
        prompt: prompt,
        temperature: 0,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      console.log("response?", JSON.stringify(response.data));
      const parsed = (response.data.choices?.[0]?.text?.split("\n") ?? [])
        .filter((p) => p)
        .map((p) => {
          const data = new Map<AnnotationTags, string>();
          p.split("|").forEach((t, i) => {
            switch (i) {
              case 0:
                data.set("BRAND", t);
                break;
              case 1:
                data.set("PRODUCT", t);
                break;
              case 2:
                data.set("OFFER", t);
                break;
            }
          });
          return data;
        });
      console.log("parsed?", parsed);
      // const parsedAnnotations = []
      const matchedAnnotations = parsed
        .map((p) => {
          return [...p.keys()]
            .map((k) => {
              const value = p.get(k);
              if (!value) return [];
              const indices = textFindIndices(input.transcript, value);
              return indices.map((i) => ({
                start: i,
                end: i + value.length,
                text: input.transcript.substring(i, i + value.length),
                tag: k,
              }));
            })
            .flat();
          // return brandIndices.map((i) => ({
          //   start: i,
          //   end: i + brandCaps.length,
          //   text: p.sponsor,
          //   tag: "BRAND",
          // }));
        })
        .flat()
        .sort((a, b) => (a.tag === "BRAND" ? -1 : a.tag === b.tag ? 0 : 1)) //move brands to start to prioritize for filter
        .filter(
          (value, index, self) =>
            value.text &&
            index ===
              self.findIndex(
                (t) =>
                  //prevent duplicates or overlap
                  t.start === value.start ||
                  (t.end > value.start && t.start < value.end) // && t.text === value.text
              )
        ) as {
        start: number;
        end: number;
        text: string;
        tag: AnnotationTags;
      }[];
      console.log("matched?", matchedAnnotations);
      if (matchedAnnotations.length > 0) {
        const transcriptRouterCaller = transcriptRouter.createCaller({
          ...ctx,
          session: { user: { id: "_openaicurie" }, expires: "" },
        });
        await transcriptRouterCaller.saveAnnotations({
          ...input,
          annotations: matchedAnnotations,
        });
      }

      return;
    }),
});
