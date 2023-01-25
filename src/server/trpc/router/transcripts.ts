import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { AnnotationTags, SponsorCategories } from "@prisma/client";

import { md5 } from "@/server/functions/hash";
import { videoRouter } from "./video";

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
                    userId: "_openaicurie",
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
      const textHash = md5(input.text);
      const create = await prisma?.transcripts.create({
        data: {
          segmentUUID: input.segmentUUID,
          text: input.text,
          textHash: textHash,
          userId: ctx.session.user.id,
          startTime: input.startTime,
          endTime: input.endTime,
        },
      });
    }),
  saveAnnotations: protectedProcedure
    .input(
      z.object({
        segment: z.object({
          UUID: z.string(),
        }),
        transcriptId: z.string().nullish(),
        transcriptDetailsId: z.string().nullish(),
        transcript: z.string().nullish(),
        startTime: z.number().nullish(),
        endTime: z.number().nullish(),
        annotations: z.array(
          z.object({
            start: z.number(),
            end: z.number(),
            text: z.string(),
            tag: z.nativeEnum(AnnotationTags),
          })
        ),
        videoId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(">>>annotation mutation", JSON.stringify(input));
      const videoRouterCaller = videoRouter.createCaller({
        ...ctx,
      });
      const saveVideo = videoRouterCaller.saveDetails({
        segmentIDs: [input.segment.UUID],
        videoId: input.videoId,
      });

      const upsertTranscriptAndUserTranscriptAnnotations = async ({
        transcriptDetailsId,
        transcriptId,
      }: {
        transcriptDetailsId: string;
        transcriptId: string;
      }) => {
        const update = await ctx.prisma.$transaction([
          ctx.prisma.transcriptAnnotations.deleteMany({
            where: {
              TranscriptDetails: {
                userId: ctx.session.user.id,
                transcriptId: transcriptId,
              },
            },
          }),

          ctx.prisma.transcriptDetails.upsert({
            where: {
              transcriptId_userId: {
                transcriptId: transcriptId,
                userId: ctx.session.user.id,
              },
              // id: input.transcriptDetailsId, //redundant
            },
            create: {
              transcriptId: transcriptId,
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
                      transcriptDetailsId: transcriptDetailsId,
                      userId: ctx.session.user.id,
                    },
                  },
                  data: {
                    direction: 1,
                  },
                },
              },
            },
          }),

          ctx.prisma.transcripts.update({
            where: {
              id: transcriptId,
            },
            data: {
              score: {
                increment:
                  (await ctx.prisma.userTranscriptDetailsVotes.count({
                    where: {
                      TranscriptDetails: {
                        userId: ctx.session.user.id,
                        transcriptId: transcriptId,
                      },
                      direction: -1,
                      // userId: { not: ctx.session.user.id },
                    },
                  })) -
                  (await ctx.prisma.userTranscriptDetailsVotes.count({
                    where: {
                      TranscriptDetails: {
                        userId: ctx.session.user.id,
                        transcriptId: transcriptId,
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
              transcriptDetailsId: transcriptDetailsId,
              userId: { not: ctx.session.user.id },
            },
          }),
        ]);
        return update[1];
      };

      if (input.transcript && input.segment.UUID) {
        const textHash = md5(input.transcript);
        const transcriptDetailsIdPromise = async () =>
          input?.transcriptDetailsId ??
          (
            await ctx.prisma.transcriptDetails.findFirst({
              where: {
                Transcript: { segmentUUID: input.segment.UUID, textHash },
                userId: ctx.session.user.id,
              },
              select: {
                id: true,
              },
            })
          )?.id;
        const transcriptIdPromise = async () =>
          input.transcriptId ??
          (
            await ctx.prisma.transcripts.findUnique({
              where: {
                segmentUUID_textHash: {
                  segmentUUID: input.segment.UUID,
                  textHash,
                },
              },
              select: {
                id: true,
              },
            })
          )?.id;
        const [transcriptDetailsId, transcriptId] = await Promise.all([
          transcriptDetailsIdPromise(),
          transcriptIdPromise(),
        ]);

        if (transcriptDetailsId && transcriptId) {
          const r = await upsertTranscriptAndUserTranscriptAnnotations({
            transcriptDetailsId,
            transcriptId,
          });
          await saveVideo;
          return r;
        }
        //new transcript or user transcript annotations
        const r = await ctx.prisma.transcripts.upsert({
          where: {
            segmentUUID_textHash: {
              segmentUUID: input.segment.UUID,
              textHash,
            },
          },
          create: {
            segmentUUID: input.segment.UUID,
            text: input.transcript,
            textHash: textHash,
            userId: ctx.session.user.id,
            startTime: input.startTime,
            endTime: input.endTime,
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
          update: {
            score: { increment: 1 },
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
        await saveVideo;
        return r;
      }
      //existing user transcript annotations
      if (input.transcriptId && input.transcriptDetailsId) {
        const r = await upsertTranscriptAndUserTranscriptAnnotations({
          transcriptId: input.transcriptId,
          transcriptDetailsId: input.transcriptDetailsId,
        });
        await saveVideo;
        return r;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing required data",
      });
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
