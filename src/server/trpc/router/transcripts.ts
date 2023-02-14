import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { AnnotationTags, SponsorCategories } from "@prisma/client";

import { md5 } from "@/server/functions/hash";
import { videoRouter } from "./video";
import {
  checkAnnotationBadWords,
  filterTranscriptBadWords,
} from "@/server/functions/badwords";
import {
  GetUserVoteSchema,
  SaveAnnotationsSchema,
  VoteTranscriptDetailsSchema,
  saveAnnotationsAndTranscript,
} from "@/server/db/transcripts";

export const transcriptRouter = router({
  get: publicProcedure
    .input(
      z.object({
        segmentUUID: z.string(),
        mode: z
          .union([
            z.literal("user"),
            z.literal("score"),
            z.literal("generated"),
          ])
          .default("score"),
        sortBy: z.union([z.literal("date"), z.literal("score")]).nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (input.mode === "generated") {
        const aiGenAnnotations = await prisma?.transcripts.findMany({
          where: {
            AND: [
              { segmentUUID: input.segmentUUID },
              {
                OR: [
                  {
                    TranscriptDetails: {
                      some: { userId: "_openaicurie" },
                    },
                  },
                  { userId: "_openaicurie" },
                ],
              },
            ],
          },
          orderBy:
            input.sortBy === "score"
              ? [{ score: "desc" }, { created: "desc" }]
              : [{ created: "desc" }, { score: "desc" }],
          select: {
            id: true,
            userId: true,
            segmentUUID: true,
            text: true,
            startTime: true,
            endTime: true,
            score: true,
            TranscriptDetails: {
              where: {
                userId: "_openaicurie",
              },
              orderBy:
                input.sortBy === "score"
                  ? [{ score: "desc" }, { created: "desc" }]
                  : [{ created: "desc" }, { score: "desc" }],
              select: {
                id: true,
                userId: true,
                score: true,
                Annotations: true,
                Votes: {
                  where: {
                    TranscriptDetails: {
                      Transcript: {
                        segmentUUID: input.segmentUUID,
                      },
                    },
                    userId: ctx.session?.user?.id, //"_openaicurie",
                  },
                },
              },
            },
          },
        });
        return aiGenAnnotations;
      } else if (input.mode === "user") {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Session required",
          });
        }
        const userSubmissions = await prisma?.transcripts.findMany({
          where: {
            AND: [
              { segmentUUID: input.segmentUUID },
              {
                OR: [
                  {
                    TranscriptDetails: {
                      some: { userId: ctx.session.user.id },
                    },
                  },
                  { userId: ctx.session.user.id },
                ],
              },
            ],
          },
          orderBy:
            input.sortBy === "score"
              ? [{ score: "desc" }, { created: "desc" }]
              : [{ created: "desc" }, { score: "desc" }],
          select: {
            id: true,
            userId: true,
            segmentUUID: true,
            text: true,
            startTime: true,
            endTime: true,
            score: true,
            TranscriptDetails: {
              where: {
                userId: ctx.session.user.id,
              },
              orderBy:
                input.sortBy === "score"
                  ? [{ score: "desc" }, { created: "desc" }]
                  : [{ created: "desc" }, { score: "desc" }],
              select: {
                id: true,
                userId: true,
                score: true,
                Annotations: true,
                Votes: {
                  where: {
                    TranscriptDetails: {
                      Transcript: {
                        segmentUUID: input.segmentUUID,
                      },
                    },
                    userId: ctx.session.user.id,
                  },
                },
              },
            },
          },
        });
        return userSubmissions;
      }
      const transcripts = await prisma?.transcripts.findMany({
        where: {
          AND: [
            { segmentUUID: input.segmentUUID },
            {
              TranscriptDetails: { some: { NOT: { userId: "_openaicurie" } } },
            },
          ],
        },
        orderBy: [{ score: "desc" }, { created: "asc" }],
        select: {
          id: true,
          userId: true,
          segmentUUID: true,
          text: true,
          startTime: true,
          endTime: true,
          score: true,
          TranscriptDetails: {
            where: { NOT: { userId: "_openaicurie" } },
            orderBy: [{ score: "desc" }, { created: "asc" }],
            select: {
              id: true,
              userId: true,
              score: true,
              Annotations: true,
              Votes: {
                where: {
                  userId: ctx.session?.user?.id,
                },
              },
            },
            take: 5,
          },
        },
        take: 5,
      });
      return transcripts;
    }),
  saveTranscript: protectedProcedure
    .input(
      z.object({
        segmentUUID: z.string(),
        text: z.string(),
        startTime: z.number().nullish(),
        endTime: z.number().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cleaned = filterTranscriptBadWords(input.text);
      if (!cleaned) {
        throw new TRPCError({
          message: "Invalid transcript. Check for profanity.",
          code: "BAD_REQUEST",
        });
      }
      const textHash = md5(cleaned);
      const create = await prisma?.transcripts.create({
        data: {
          segmentUUID: input.segmentUUID,
          text: cleaned,
          textHash: textHash,
          userId: ctx.session.user.id,
          startTime: input.startTime,
          endTime: input.endTime,
        },
      });
    }),
  saveAnnotations: protectedProcedure
    .input(SaveAnnotationsSchema)
    .mutation(async ({ input, ctx }) => {
      console.log(">>>annotation mutation", JSON.stringify(input));
      return await saveAnnotationsAndTranscript({ input, ctx });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        transcriptId: z.string().nullish(),
        transcriptDetailsId: z.string().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.transcriptDetailsId) {
        await ctx.prisma.transcriptDetails.delete({
          where: { id: input.transcriptDetailsId },
        });
      } else if (input.transcriptId) {
        await ctx.prisma.transcripts.delete({
          where: { id: input.transcriptId },
        });
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Missing required data. Provide a transcriptId or transcriptDetailsId",
        });
      }
    }),
  getMyVote: protectedProcedure
    .input(GetUserVoteSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) return { direction: 0 };
      const vote = await ctx.prisma.userTranscriptDetailsVotes.findUnique({
        where: {
          userId_transcriptDetailsId: {
            userId: ctx.session.user.id,
            transcriptDetailsId: input.transcriptDetailsId,
          },
        },
      });
      return { direction: vote?.direction ?? 0 };
    }),
  voteTranscriptDetails: protectedProcedure
    .input(VoteTranscriptDetailsSchema)
    .mutation(async ({ input, ctx }) => {
      const scoreUpdate = () =>
        input.direction === 1
          ? input.previous === -1
            ? 2
            : input.previous === 0
            ? 1
            : 0
          : input.direction === -1
          ? input.previous === 1
            ? -2
            : input.previous === 0
            ? -1
            : 0
          : input.direction === 0
          ? input.previous === 1
            ? -1
            : input.previous === -1
            ? 1
            : 0
          : 0;

      await ctx.prisma.userTranscriptDetailsVotes.upsert({
        where: {
          userId_transcriptDetailsId: {
            userId: ctx.session.user.id,
            transcriptDetailsId: input.transcriptDetailsId,
          },
        },
        create: {
          userId: ctx.session.user.id,
          transcriptDetailsId: input.transcriptDetailsId,
          direction: input.direction,
        },
        update: {
          direction: input.direction,
          TranscriptDetails: {
            update: {
              score: {
                increment: scoreUpdate(),
              },
              Transcript: {
                update: {
                  score: {
                    increment: scoreUpdate(),
                  },
                },
              },
            },
          },
        },
      });
    }),
});
