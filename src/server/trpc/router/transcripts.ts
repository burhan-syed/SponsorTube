import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { AnnotationTags } from "@prisma/client";

import { md5 } from "@/server/functions/hash";

export const transcriptRouter = router({
  get: publicProcedure
    .input(z.object({ segmentUUID: z.string() }))
    .query(async ({ input, ctx }) => {
      const transcripts = await prisma?.transcripts.findMany({
        where: { segmentUUID: input.segmentUUID },
        orderBy: [{ score: "desc" }, { created: "asc" }],
        select: {
          id: true,
          segmentUUID: true,
          text: true,
          startTime: true,
          endTime: true,
          score: true,
          TranscriptDetails: {
            orderBy: [{ score: "desc" }, { created: "asc" }],
            select: {
              id: true,
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
  getUserSubmissions: protectedProcedure
    .input(z.object({ segmentUUID: z.string() }))
    .query(async ({ input, ctx }) => {
      const userSubmissions = await prisma?.transcripts.findMany({
        where: { TranscriptDetails: { some: { userId: ctx.session.user.id } } },
        select: {
          id: true,
          segmentUUID: true,
          text: true,
          startTime: true,
          endTime: true,
          TranscriptDetails: {
            where: { userId: ctx.session.user.id },
            orderBy: [{ created: "asc" }],
            select: {
              Annotations: true,
            },
          },
        },
      });
      return userSubmissions;
    }),
  saveTranscript: protectedProcedure
    .input(z.object({ segmentUUID: z.string(), text: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const textHash = md5(input.text);
      const create = await prisma?.transcripts.create({
        data: {
          segmentUUID: input.segmentUUID,
          text: input.text,
          textHash: textHash,
          userId: ctx.session.user.id,
        },
      });
    }),
  saveAnnotations: protectedProcedure
    .input(
      z.object({
        transcriptId: z.string().nullish(),
        transcriptDetailsId: z.string().nullish(),
        transcript: z.string().nullish(),
        segmentUUID: z.string().nullish(),
        annotations: z.array(
          z.object({
            start: z.number(),
            end: z.number(),
            text: z.string(),
            tag: z.nativeEnum(AnnotationTags),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      //case: fresh annotations, no transcript or transcript details
      console.log(
        "UUID?",
        input.segmentUUID,
        "length?",
        input.segmentUUID?.length
      );
      if (!input.transcriptId && input.transcript && input.segmentUUID) {
        const textHash = md5(input.transcript);

        return await ctx.prisma.transcripts.create({
          data: {
            segmentUUID: input.segmentUUID,
            text: input.transcript,
            textHash: textHash,
            userId: ctx.session.user.id,
            score: 1,
            TranscriptDetails: {
              create: {
                userId: ctx.session.user.id,
                score: 1,
                Annotations: {
                  createMany: { data: input.annotations },
                },
                Votes: {
                  create: {
                    direction: 1,
                    userId: ctx.session.user.id,
                  },
                },
              },
            },
          },
        });
      }
      //existing transcript
      if (input.transcriptId && input.transcriptDetailsId) {
        const update = await ctx.prisma.$transaction([
          ctx.prisma.transcriptAnnotations.deleteMany({
            where: {
              TranscriptDetails: {
                userId: ctx.session.user.id,
                transcriptId: input.transcriptId,
              },
            },
          }),

          ctx.prisma.transcriptDetails.upsert({
            where: {
              transcriptId_userId: {
                transcriptId: input.transcriptId,
                userId: ctx.session.user.id,
              },
              // id: input.transcriptDetailsId, //redundant
            },
            create: {
              transcriptId: input.transcriptId,
              userId: ctx.session.user.id,
              score: 1,
              Annotations: {
                createMany: { data: input.annotations },
              },
              Votes: {
                create: {
                  userId: ctx.session.user.id,
                  direction: 1,
                },
              },
            },
            update: {
              score: 1,
              Annotations: {
                createMany: { data: input.annotations },
              },
              Votes: {
                update: {
                  where: {
                    userId_transcriptDetailsId: {
                      transcriptDetailsId: input.transcriptDetailsId,
                      userId: ctx.session.user.id,
                    },
                  },
                  data: {
                    direction: 1,
                  },
                },
              },
              // Transcript: {
              //   update: {
              //     score: {
              //       increment:
              //         (await ctx.prisma.userTranscriptDetailsVotes.count({
              //           where: {
              //             TranscriptDetails: {
              //               userId: ctx.session.user.id,
              //               transcriptId: input.transcriptId,
              //             },
              //             direction: -1,
              //             // userId: { not: ctx.session.user.id },
              //           },
              //         })) -
              //         (await ctx.prisma.userTranscriptDetailsVotes.count({
              //           where: {
              //             TranscriptDetails: {
              //               userId: ctx.session.user.id,
              //               transcriptId: input.transcriptId,
              //             },
              //             direction: 1,
              //             // userId: { not: ctx.session.user.id },
              //           },
              //         })) + 1 //auto up-vote by submitted user,
              //     },
              //   },
              // },
            },
          }),

          ctx.prisma.transcripts.update({
            where: {
              id: input.transcriptId,
            },
            data: {
              score: {
                increment:
                  (await ctx.prisma.userTranscriptDetailsVotes.count({
                    where: {
                      TranscriptDetails: {
                        userId: ctx.session.user.id,
                        transcriptId: input.transcriptId,
                      },
                      direction: -1,
                      // userId: { not: ctx.session.user.id },
                    },
                  })) -
                  (await ctx.prisma.userTranscriptDetailsVotes.count({
                    where: {
                      TranscriptDetails: {
                        userId: ctx.session.user.id,
                        transcriptId: input.transcriptId,
                      },
                      direction: 1,
                      // userId: { not: ctx.session.user.id },
                    },
                  })) +
                  1, //auto up-vote by submitted user,
              },
            },
          }),

          ctx.prisma.userTranscriptDetailsVotes.deleteMany({
            where: {
              // TranscriptDetails: {
              //   userId: ctx.session.user.id,
              //   transcriptId: input.transcriptId,
              // },
              transcriptDetailsId: input.transcriptDetailsId,
              userId: { not: ctx.session.user.id },
            },
          }),
        ]);
        return update[1];
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing required data",
      });
    }),
  getMyVote: publicProcedure
    .input(z.object({ transcriptDetailsId: z.string() }))
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
    .input(
      z.object({
        transcriptDetailsId: z.string(),
        previous: z.number(),
        direction: z.number(),
        transcriptId: z.string(),
      })
    )
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
