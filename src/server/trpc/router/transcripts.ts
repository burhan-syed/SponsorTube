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
          TranscriptDetails: {
            orderBy: [{ score: "desc" }, { created: "asc" }],
            select: {
              Annotations: true,
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
            TranscriptDetails: {
              create: {
                userId: ctx.session.user.id,
                Annotations: {
                  createMany: { data: input.annotations },
                },
              },
            },
          },
        });
      }
      //existing transcript
      if (input.transcriptId) {
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
            },
            create: {
              transcriptId: input.transcriptId,
              userId: ctx.session.user.id,
              Annotations: {
                createMany: { data: input.annotations },
              },
            },
            update: {
              Annotations: {
                //set: [],
                createMany: { data: input.annotations },
              },
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
});
