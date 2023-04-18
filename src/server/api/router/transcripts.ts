import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  GetUserVoteSchema,
  SaveAnnotationsSchema,
  SaveTranscriptSchema,
  VoteTranscriptDetailsSchema,
  saveAnnotationsAndTranscript,
  saveTranscript,
} from "@/server/db/transcripts";
import { getBotIds } from "@/server/db/bots";
import {
  compareAndUpdateVideoSponsors,
  getVideoSponsors,
  updateVideoSponsorsFromDB,
} from "@/server/db/sponsors";

export const transcriptRouter = createTRPCRouter({
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
        const botIds = await getBotIds({ prisma: ctx.prisma });
        const aiGenAnnotations = await ctx.prisma?.transcripts.findMany({
          where: {
            AND: [
              { segmentUUID: input.segmentUUID },
              {
                OR: [
                  {
                    TranscriptDetails: {
                      some: { userId: { in: botIds } },
                    },
                  },
                  { userId: { in: botIds } },
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
                userId: { in: botIds },
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
                Votes: ctx.session?.user.id
                  ? {
                      where: {
                        TranscriptDetails: {
                          Transcript: {
                            segmentUUID: input.segmentUUID,
                          },
                        },
                        userId: ctx.session?.user?.id,
                      },
                    }
                  : false,
              },
            },
          },
          take: 1,
        });
        return aiGenAnnotations;
      } else if (input.mode === "user") {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Session required",
          });
        }
        const userSubmissions = await ctx.prisma?.transcripts.findMany({
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
      const botIds = await getBotIds({ prisma: ctx.prisma });
      const transcripts = await ctx.prisma?.transcripts.findMany({
        where: {
          AND: [
            { segmentUUID: input.segmentUUID },
            {
              TranscriptDetails: { some: { NOT: { userId: { in: botIds } } } },
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
            where: { NOT: { userId: { in: botIds } } },
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
    .input(SaveTranscriptSchema)
    .mutation(async ({ input, ctx }) => {
      await saveTranscript({ input, ctx });
    }),
  saveAnnotations: protectedProcedure
    .input(SaveAnnotationsSchema)
    .mutation(async ({ input, ctx }) => {
      console.log(">>>annotation mutation", JSON.stringify(input));
      const save = await saveAnnotationsAndTranscript({ input, ctx });
      input.videoId &&
        (await updateVideoSponsorsFromDB({ videoId: input.videoId, ctx }));
      return save;
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
      const scoreUpdate = (previous = 0) =>
        input.direction === 1
          ? previous < 0
            ? 2
            : previous === 0
            ? 1
            : 0
          : input.direction === -1
          ? previous > 0
            ? -2
            : previous === 0
            ? -1
            : 0
          : input.direction === 0
          ? previous > 0
            ? -1
            : previous < 0
            ? 1
            : 0
          : 0;
      const [previous, storedSponsors] = await Promise.all([
        ctx.prisma.userTranscriptDetailsVotes.findUnique({
          where: {
            userId_transcriptDetailsId: {
              userId: ctx.session.user.id,
              transcriptDetailsId: input.transcriptDetailsId,
            },
          },
        }),
        getVideoSponsors({
          videoId: input.segmentUUID,
          prisma: ctx.prisma,
          withScore: true,
        }),
      ]);

      const update = await ctx.prisma.userTranscriptDetailsVotes.upsert({
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
                increment: scoreUpdate(previous?.direction),
              },
              Transcript: {
                update: {
                  score: {
                    increment: scoreUpdate(previous?.direction),
                  },
                },
              },
            },
          },
        },
        include: {
          TranscriptDetails: {
            select: {
              score: true,
            },
          },
        },
      });

      const segmentStoredSponsors = storedSponsors.find(
        (s) => s.TranscriptDetails?.Transcript.segmentUUID === input.segmentUUID
      );
      if (
        !segmentStoredSponsors ||
        ((input.direction === 0 || input.direction === -1) &&
          update.transcriptDetailsId ===
            segmentStoredSponsors.transcriptDetailsId) ||
        update.TranscriptDetails.score >=
          (segmentStoredSponsors.TranscriptDetails?.score ?? -1)
      ) {
        await compareAndUpdateVideoSponsors({
          videoId: input.videoId,
          prisma: ctx.prisma,
        });
        return { revalidate: true };
      }
      return { revalidate: false };
    }),
});
