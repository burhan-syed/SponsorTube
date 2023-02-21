import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "../../env/server.mjs";
import { OpenAIApi, Configuration } from "openai";
import { textFindIndices } from "@/utils";

import type { PrismaClient, AnnotationTags } from "@prisma/client";
import type { Context } from "../trpc/context";
import { md5 } from "../functions/hash";
import { saveAnnotationsAndTranscript } from "./transcripts";

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});

export const GetSegmentAnnotationsSchema = z.object({
  segment: z.object({
    UUID: z.string(),
  }),
  videoId: z.string(),
  transcriptId: z.string().nullish(),
  transcriptDetailsId: z.string().nullish(),
  transcript: z.string(),
  startTime: z.number().nullish(),
  endTime: z.number().nullish(),
});

type GetSegmentAnnotationsType = z.infer<typeof GetSegmentAnnotationsSchema>;

export const getBotIds = async ({ prisma }: { prisma: PrismaClient }) => {
  const bots = await prisma?.bots.findMany();
  if (!bots) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No Bots Found",
    });
  }
  return bots.map((b) => b.id);
};

export const getSegmentAnnotationsOpenAICall = async ({
  input,
  ctx,
}: {
  input: GetSegmentAnnotationsType;
  ctx: Context;
}) => {
  const textHash = md5(input.transcript);

  const bots = await ctx.prisma?.bots.findMany({
    include: { User: { select: { id: true } } },
  });

  if (!bots?.[0]) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No Bots Found",
    });
  }
  const bot = bots[0];

  const queue = await ctx.prisma.botQueue.findFirst({
    where: {
      Transcript: { textHash: textHash, segmentUUID: input.segment.UUID },
      botId: bot.id,
    },
  });

  if (queue?.status) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Bot annotations previously requested at ${queue.timeInitialized}`,
      cause: queue,
    });
  }
  // const previousAnnotations = await prisma?.transcriptDetails.findMany({
  //   where: {
  //     userId: bot.id,
  //     Transcript: { textHash: textHash, segmentUUID: input.segment.UUID },
  //   },
  // });

  // if (previousAnnotations && previousAnnotations.length > 0) {
  //   throw new TRPCError({
  //     message: "Segment already analyzed",
  //     code: "BAD_REQUEST",
  //   });
  // }

  const transcript = await ctx.prisma.transcripts.upsert({
    where: {
      segmentUUID_textHash: {
        segmentUUID: input.segment.UUID,
        textHash: textHash,
      },
    },
    create: {
      textHash: textHash,
      segmentUUID: input.segment.UUID,
      text: input.transcript,
      userId: bot.User.id,
      created: new Date(),
      startTime: input.startTime,
      endTime: input.endTime,
    },
    update: {},
  });

  const botQueue = await ctx.prisma.botQueue.create({
    data: {
      botId: bot.id,
      transcriptId: transcript.id,
      status: "pending",
      lastUpdated: new Date(),
    },
  });

  try {
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

    await ctx.prisma.botQueue.update({
      where: { id: botQueue.id },
      data: {
        status: "completed",
        lastUpdated: new Date(),
        responseId: response.data.id,
        promptTokens: response.data.usage?.prompt_tokens,
        totalTokens: response.data.usage?.completion_tokens,
      },
    });
  } catch (err) {
    await ctx.prisma.botQueue.update({
      where: { id: botQueue.id },
      data: { status: "error", lastUpdated: new Date() },
    });
  }

  return;
};
