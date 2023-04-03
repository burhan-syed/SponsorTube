import { CustomError } from "../common/errors";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
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
import type { Context } from "@/server/api/trpc";
import type VideoInfo from "youtubei.js/dist/src/parser/youtube/VideoInfo.js";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_RETRY = 10;

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
    const message = "No Bots Found";
    const cError = new CustomError({ message, type: "" });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: message,
      cause: cError,
    });
  }
  return bots.map((b) => b.id);
};

export const getSegmentAnnotationsOpenAICall = async ({
  input,
  ctx,
  inputVideoInfo,
  stopAt,
}: {
  input: GetSegmentAnnotationsType;
  ctx: Context;
  inputVideoInfo?: VideoInfo;
  stopAt?: Date;
}) => {
  if (input.transcript.length > 2048) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Input segment too long",
      cause: new CustomError({
        message: "Input segment too long. Please annotate manually.",
        expose: true,
        level: "PARTIAL",
      }),
    });
  }

  const textHash = md5(input.transcript);

  const bots = await ctx.prisma?.bots.findMany({
    include: { User: { select: { id: true } } },
    where: { id: "_openaigpt3.5turbo" },
  });

  if (!bots?.[0]) {
    const message = "No Bots Found";
    const cError = new CustomError({ message, type: "" });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: message,
      cause: cError,
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
    const cError = new CustomError({
      message: "Request pending",
      type: "BOT_PENDING",
      expose: true,
    });
    throw new TRPCError({
      code: "CONFLICT",
      message: `Bot annotations previously requested at ${queue.timeInitialized}: ${queue.id} Status: ${queue.status}`,
      cause: cError,
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
    const makeOpenAICall = async (
      bot: Bots,
      retry = 0
    ): Promise<
      CreateChatCompletionResponse | CreateCompletionResponse | undefined
    > => {
      const delay = 2 ** retry * 100 + Math.random() * 10;
      if (stopAt && retry && new Date().getTime() + delay >= stopAt.getTime()) {
        throw new TRPCError({
          message: "out of time",
          code: "TIMEOUT",
          cause: new CustomError({
            expose: true,
            message: "request timed out",
            level: "COMPLETE",
          }),
        });
      }
      retry && (await new Promise((resolve) => setTimeout(resolve, delay)));
      try {
        const openai = new OpenAIApi(configuration);
        if (bot.model === "gpt-3.5-turbo") {
          const prompt = `Create a table to identify sponsor information if there is any in the following text:\n"${input.transcript}"\n\n|Sponsor|Product|URL|Promo Code|Offer|`;
          const response = await openai.createChatCompletion({
            model: bot.model,
            messages: [
              {
                role: "system",
                content: "You parse text and create tables",
              },
              { role: "user", content: prompt },
            ],
            temperature: bot?.temperature ?? 0.7, //0,
            max_tokens: bot?.maxTokens ?? 100,
            top_p: bot?.topP ?? 1,
            frequency_penalty: bot?.frequencyPenalty ?? 0,
            presence_penalty: bot?.presencePenalty ?? 0,
          });
          //console.log("AI RES?", response.headers);
          return response.data;
        } else {
          const prompt = `Create a table to identify sponsor information if there is any in the following text:\n"${input.transcript}"\n\n|Sponsor|Product|URL|Promo Code|Offer|\n\n`;
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
      } catch (err) {
        if ((err as any)?.response?.status === 429 && retry <= MAX_RETRY) {
          console.log("DEBOUNCE", input.videoId, retry, delay);
          return makeOpenAICall(bot, ++retry);
        } else {
          console.log("OPENAI ERR", err);
          throw err;
        }
      }
    };

    const timeOutOpenAICall = async (bot: Bots) => {
      const SECTOTIMEOUT = 20;
      let returnObject:
        | CreateCompletionResponse
        | CreateChatCompletionResponse
        | undefined;
      let timedOut = false;
      await Promise.race([
        (async () => {
          returnObject = await makeOpenAICall(bot);
        })(),
        new Promise((resolve) =>
          setTimeout((v) => {
            timedOut = true;
            resolve(v);
          }, SECTOTIMEOUT * 1000)
        ),
      ]);
      if (timedOut) {
        const message = "request timed out";
        throw new TRPCError({
          message,
          code: "TIMEOUT",
          cause: new CustomError({
            level: "COMPLETE",
            message,
            type: "BOT_ERROR",
            expose: true,
          }),
        });
      }
      return returnObject;
    };

    const responseData = (
      botQueue.rawResponseData
        ? typeof botQueue.rawResponseData === "string"
          ? JSON.parse(botQueue.rawResponseData)
          : botQueue.rawResponseData
        : await timeOutOpenAICall(bot)
    ) as CreateCompletionResponse | CreateChatCompletionResponse | undefined;

    //console.log("response?", JSON.stringify(responseData, null, 2));

    if (!responseData) {
      const cError = new CustomError({
        level: "COMPLETE",
        message: "bot unavailable",
        type: "BOT_ERROR",
        expose: true,
      });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No bot response",
        cause: cError,
      });
    }
    const rawResponseData = JSON.stringify(responseData);

    const parseResponseData = (
      responseData: CreateCompletionResponse | CreateChatCompletionResponse
    ) => {
      const formatText = (t?: string) => {
        const split = t?.split("\n") ?? [t];
        //console.log("split?", split);
        const columns = { brand: 0, product: 1, url: 2, code: 3, offer: 4 };
        return split
          ?.filter((p) => p)
          ?.map((p, line) => {
            const data = new Map<AnnotationTags, string>();
            const fillData = (
              rawText: string | undefined,
              switchCase: string | number,
              columns: {
                brand: number | string;
                product: number | string;
                offer: number | string;
                url: number | string | string[];
                code: number | string | string[];
              }
            ) => {
              const ignoreWords = [
                "-",
                "sponsor",
                "product",
                "offer",
                "url",
                "promo code",
                // "link below",
                // "link down below",
                "n/a",
                "---",
              ]; //lowercase matching

              const textFormatted = rawText?.trim();

              if (
                textFormatted &&
                !ignoreWords.includes(textFormatted.toLowerCase()) &&
                (textFormatted.length < 24 ||
                  switchCase === columns.offer ||
                  switchCase === columns.url)
              ) {
                switch (switchCase) {
                  case columns.brand:
                    data.set("BRAND", textFormatted);
                    break;
                  case columns.product:
                    data.set("PRODUCT", textFormatted);
                    break;
                  case columns.offer:
                    data.set("OFFER", textFormatted);
                    break;
                  case typeof switchCase === "string" &&
                  Array.isArray(columns.url)
                    ? columns.url.includes(switchCase)
                    : columns.url:
                    data.set("URL", textFormatted);
                    break;
                  case typeof switchCase === "string" &&
                  Array.isArray(columns.code)
                    ? columns.code.includes(switchCase)
                    : columns.code:
                    data.set("CODE", textFormatted);
                    break;
                }
              }
            };
            //expected table response
            if (p?.includes("|")) {
              if (p?.charAt(0) === "|") {
                //response was shifted
                columns.brand = 1;
                columns.product = 2;
                columns.url = 3;
                columns.code = 4;
                columns.offer = 5;
              }
              p?.split("|").forEach((t, i) => {
                if (line === 0) {
                  const textLower = t?.trim()?.toLowerCase();
                  //response has table headers
                  if (textLower === "sponsor" || textLower === "brand") {
                    columns.brand = i;
                  } else if (textLower === "product") {
                    columns.product = i;
                  } else if (textLower === "offer") {
                    columns.offer = i;
                  } else if (
                    textLower === "url" ||
                    textLower === "website" ||
                    textLower === "link"
                  ) {
                    columns.url = i;
                  } else if (
                    textLower === "code" ||
                    textLower === "promo code" ||
                    textLower === "promo"
                  ) {
                    columns.code = i;
                  }
                }
                fillData(t, i, columns);
              });
            }
            //sometimes gpt likes to respond in this format..
            else if (p?.includes(":")) {
              const split = p.split(":");
              if (split?.[0] && split?.[1]) {
                fillData(split?.[1], split?.[0]?.toLowerCase(), {
                  brand: "sponsor",
                  product: "product",
                  offer: "offer",
                  code: ["code", "offer code", "promo code"],
                  url: ["url", "website", "link"],
                });
              }
            }

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

    if (!parsed) {
      const cError = new CustomError({
        message: "Bot failed to parse data",
        type: "BOT_ERROR",
        level: "PARTIAL",
        expose: true,
      });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No parsed data",
        cause: cError,
      });
    }

    const matchAndUpdateText = (
      originalText: string,
      newTextSegment: string
    ): string => {
      //original transcripts may be missing the following characters which gpt will respond with.
      const chars = ["%", "/", "$", "https://", "."];
      if (
        originalText.includes(newTextSegment) ||
        !chars.some((c) => newTextSegment.includes(c))
      ) {
        return originalText;
      }
      const replacedNewTexts = [
        newTextSegment.replace(/%|\/|\$|https:\/\/|\./gm, ""),
        newTextSegment.replace(/%|\/|\$|https:\/\/|\./gm, " "),
        //newTextSegment.replace(/%|\/|\$|https:\/\/|\./gm, " or "),
      ];
      if (!replacedNewTexts.some((r) => r !== newTextSegment)) {
        return originalText;
      }
      const regEscape = (v: string) =>
        v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const updatedTexts = replacedNewTexts.map((newText) => {
        const splitOriginalText = originalText.split(
          new RegExp(regEscape(newText), "ig")
        );
        //matched new text not in original text
        if (splitOriginalText.length === 0) {
          return originalText;
        }
        //insert the new text where split took place
        return splitOriginalText.join(newTextSegment);
      });

      //return an updated text that is different from original
      for (let i = 0; i < updatedTexts.length; i++) {
        if (updatedTexts[i] && updatedTexts[i] !== originalText) {
          return updatedTexts[i] ?? originalText;
        }
      }

      return originalText;
    };

    //match transcript with special characters returned in gpt responses
    const parsedToArray: string[] = [...parsed.values()]
      .map((v) => [...v.values()])
      .flat();
    let updatedTranscript = input.transcript;
    for (let i = 0; i < parsedToArray.length; i++) {
      updatedTranscript = matchAndUpdateText(
        updatedTranscript,
        parsedToArray?.[i] ?? ""
      );
    }
    const matchedAnnotations = parsed
      .map((p) => {
        return [...p.keys()]
          .map((k) => {
            const value = p.get(k);
            if (!value) return [];
            const indices = textFindIndices(updatedTranscript, value);
            return indices.map((i) => ({
              start: i,
              end: i + value.length,
              text: updatedTranscript.substring(i, i + value.length),
              tag: k,
            }));
          })
          .flat();
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
    try {
      if (matchedAnnotations.length > 0) {
        const transformedInputValues =
          updatedTranscript === input.transcript
            ? { transcriptId: transcript.id }
            : { transcript: updatedTranscript };

        await saveAnnotationsAndTranscript({
          input: {
            ...input,
            annotations: matchedAnnotations,
            ...transformedInputValues,
          },
          ctx: {
            ...ctx,
            session: { user: { id: bot.id }, expires: "" },
          },
          inputVideoInfo,
        });
      } else {
        const cError = new CustomError({
          message: "Bot failed to parse data",
          type: "BOT_ERROR",
          level: "PARTIAL",
          expose: true,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to match sponsor information",
          cause: cError,
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
        input.segment.UUID
        //err
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

      throw err;
    }
  } catch (err) {
    await ctx.prisma.botQueue.update({
      where: { id: botQueue.id },
      data: { status: "error", lastUpdated: new Date() },
    });

    throw err;
  }

  return;
};
