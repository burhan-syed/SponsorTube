import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "../../env/server.mjs";
import {
  OpenAIApi,
  Configuration,
  CreateCompletionResponse,
  CreateChatCompletionResponse,
} from "openai";
import { textFindIndices } from "@/utils";
import { md5 } from "../functions/hash";
import { saveAnnotationsAndTranscript } from "./transcripts";
import type {
  PrismaClient,
  AnnotationTags,
  BotQueue,
  Bots,
} from "@prisma/client";
import type { Context } from "../trpc/context";
import type VideoInfo from "youtubei.js/dist/src/parser/youtube/VideoInfo.js";

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

export type GetSegmentAnnotationsType = z.infer<
  typeof GetSegmentAnnotationsSchema
>;

export const isUserABot = async ({ ctx }: { ctx: Context }) => {
  return ctx.session?.user?.id
    ? !!(await ctx.prisma.bots.findUnique({
        where: { id: ctx.session?.user?.id },
      }))
    : false;
};

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
  inputVideoInfo,
}: {
  input: GetSegmentAnnotationsType;
  ctx: Context;
  inputVideoInfo?: VideoInfo;
}) => {
  const textHash = md5(input.transcript);

  const bots = await ctx.prisma?.bots.findMany({
    include: { User: { select: { id: true } } },
    where: { id: "_openaigpt3.5turbo" },
  });

  if (!bots?.[0]) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No Bots Found",
    });
  }
  const bot = bots[0];

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

  const queue = await ctx.prisma.botQueue.findUnique({
    where: {
      // Transcript: { textHash: textHash, segmentUUID: input.segment.UUID },
      // botId: bot.id,
      transcriptId_botId: {
        transcriptId: transcript.id,
        botId: bot.id,
      },
    },
  });

  if (queue?.status === "completed" || queue?.status === "pending") {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Bot annotations previously requested at ${queue.timeInitialized}: ${queue.id} Status: ${queue.status}`,
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

  const botQueue = await ctx.prisma.botQueue.upsert({
    where: {
      transcriptId_botId: { transcriptId: transcript.id, botId: bot.id },
    },
    create: {
      botId: bot.id,
      transcriptId: transcript.id,
      videoId: input.videoId,
      status: "pending",
      lastUpdated: new Date(),
      timeInitialized: new Date(),
    },
    update: {
      status: "pending",
      timeInitialized: new Date(),
    },
  });

  try {
    const makeOpenAICall = async (bot: Bots) => {
      const openai = new OpenAIApi(configuration);
      if (bot.model === "gpt-3.5-turbo") {
        const prompt = `Create a table to identify sponsor information if there is any in the following text:\n"${input.transcript}"\n\nSponsor|Product|Offer|`;
        const response = await openai.createChatCompletion({
          model: bot.model,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that will only create tables",
            },
            { role: "user", content: prompt },
          ],
          temperature: bot?.temperature ?? 0.7, //0,
          max_tokens: bot?.maxTokens ?? 100,
          top_p: bot?.topP ?? 1,
          frequency_penalty: bot?.frequencyPenalty ?? 0,
          presence_penalty: bot?.presencePenalty ?? 0,
        });
        return response.data;
      } else {
        const prompt = `Create a table to identify sponsor information if there is any in the following text:\n"${input.transcript}"\n\nSponsor|Product|Offer|\n\n`;
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
        return response.data;
      }
    };

    const responseData = (
      botQueue.rawResponseData
        ? typeof botQueue.rawResponseData === "string"
          ? JSON.parse(botQueue.rawResponseData)
          : botQueue.rawResponseData
        : await makeOpenAICall(bot)
    ) as CreateCompletionResponse | CreateChatCompletionResponse | undefined;

    console.log("response?", JSON.stringify(responseData, null, 2));

    if (!responseData) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No OpenAI response",
      });
    }
    const rawResponseData = JSON.stringify(responseData);

    const ignoreWords = ["-", "sponsor", "product", "offer", "---"];
    const parseResponseData = (
      responseData: CreateCompletionResponse | CreateChatCompletionResponse
    ) => {
      const formatText = (t?: string) => {
        const split = t?.split("\n") ?? [t];
        console.log("split?", split);
        const columns = { brand: 0, product: 1, offer: 1 };
        return split
          ?.filter((p) => p)
          ?.map((p, line) => {
            const data = new Map<AnnotationTags, string>();

            p?.split("|").forEach((t, i) => {
              const textFormatted = t?.trim();
              if (line === 0) {
                const textLower = textFormatted.toLowerCase();
                if (textLower === "sponsor" || textLower === "brand") {
                  columns.brand = i;
                } else if (textLower === "product") {
                  columns.product = i;
                } else if (textLower === "offer") {
                  columns.offer = i;
                }
              }
              if (
                textFormatted &&
                !ignoreWords.includes(textFormatted.toLowerCase()) &&
                textFormatted.length < 24
              ) {
                switch (i) {
                  case columns.brand:
                    data.set("BRAND", textFormatted);
                    break;
                  case columns.product:
                    data.set("PRODUCT", textFormatted);
                    break;
                  case columns.offer:
                    data.set("OFFER", textFormatted);
                    break;
                }
              }
            });
            return data;
          });
      };

      if ((responseData as CreateCompletionResponse)?.choices?.[0]?.text) {
        return formatText(
          (responseData as CreateCompletionResponse).choices?.[0]?.text
        );
      } else if (
        (responseData as CreateChatCompletionResponse)?.choices?.[0]?.message
          ?.content
      ) {
        return formatText(
          (responseData as CreateChatCompletionResponse)?.choices?.[0]?.message
            ?.content
        );
      }
    };

    const parsed = parseResponseData(responseData);
    console.log("parsed?", parsed);
    // const parsedAnnotations = [];
    if (!parsed) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No parsed data",
      });
    }
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
    //console.log("matched?", matchedAnnotations);
    try {
      if (matchedAnnotations.length > 0) {
        await saveAnnotationsAndTranscript({
          input: {
            ...input,
            annotations: matchedAnnotations,
            transcriptId: transcript.id,
          },
          ctx: {
            ...ctx,
            session: { user: { id: bot.id }, expires: "" },
          },
          inputVideoInfo,
        });
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to match sponsor information",
        });
      }
      await ctx.prisma.botQueue.update({
        where: { id: botQueue.id },
        data: {
          status: "completed",
          lastUpdated: new Date(),
          responseId: responseData.id,
          promptTokens: responseData.usage?.prompt_tokens,
          totalTokens: responseData.usage?.total_tokens,
          rawResponseData: rawResponseData,
        },
      });
    } catch (err) {
      console.error(
        "failed to save video & annotations",
        input.videoId,
        input.segment.UUID,
        err
      );
      await ctx.prisma.botQueue.update({
        where: { id: botQueue.id },
        data: {
          status: "error",
          lastUpdated: new Date(),
          responseId: responseData.id,
          promptTokens: responseData.usage?.prompt_tokens,
          totalTokens: responseData.usage?.total_tokens,
          rawResponseData: rawResponseData,
        },
      });
    }
  } catch (err) {
    await ctx.prisma.botQueue.update({
      where: { id: botQueue.id },
      data: { status: "error", lastUpdated: new Date() },
    });
  }

  return;
};
