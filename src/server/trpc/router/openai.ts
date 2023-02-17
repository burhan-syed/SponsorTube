import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { OpenAIApi, Configuration } from "openai";

import { AnnotationTags } from "@prisma/client";
import { textFindIndices } from "@/utils";
import { md5 } from "@/server/functions/hash";
import { TRPCError } from "@trpc/server";
import { saveAnnotationsAndTranscript } from "@/server/db/transcripts";
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
        segment: z.object({
          UUID: z.string(),
        }),
        videoId: z.string(),
        transcriptId: z.string().nullish(),
        transcriptDetailsId: z.string().nullish(),
        transcript: z.string(),
        startTime: z.number().nullish(),
        endTime: z.number().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const textHash = md5(input.transcript);

      const bots = await prisma?.bots.findMany();

      if (!bots?.[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No Bots Found",
        });
      }
      const bot = bots[0];

      console.log("OPEN AI FETCH WITH ", bot.id)

      const previousAnnotations = await prisma?.transcriptDetails.findMany({
        where: {
          userId: bot.id,
          Transcript: { textHash: textHash, segmentUUID: input.segment.UUID },
        },
      });

      if (previousAnnotations && previousAnnotations.length > 0) {
        throw new TRPCError({
          message: "Segment already analyzed",
          code: "BAD_REQUEST",
        });
      }

      const openai = new OpenAIApi(configuration);
      const prompt = `Create a table to identify sponsor information if there is any in the following text:\n\"${input.transcript}"\n\nSponsor|Product|Offer|\n\n`;
      const response = await openai.createCompletion({
        model: bot.model, //"text-curie-001",
        prompt: prompt,
        temperature: bot?.temperature ?? 0, //0,
        max_tokens: bot?.maxTokens ?? 100,
        top_p: bot?.topP ?? 1,
        frequency_penalty: bot?.frequencyPenalty ?? 0,
        presence_penalty: bot?.presencePenalty ?? 0,
        //user
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
        await saveAnnotationsAndTranscript({
          input: { ...input, annotations: matchedAnnotations },
          ctx: {
            ...ctx,
            session: { user: { id: bot.id }, expires: "" },
          },
        });
      }

      return;
    }),
});
