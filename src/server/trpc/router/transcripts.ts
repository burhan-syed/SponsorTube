import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { AnnotationTags } from "@prisma/client";

export const transcriptRouter = router({
  get: publicProcedure
    .input(z.object({ segmentUUID: z.string() }))
    .query(async ({ input, ctx }) => {
      const transcripts = await prisma?.transcripts.findMany({
        where: { segmentUUID: input.segmentUUID },
        orderBy: [ {score: "desc"}, {id: "desc"} ],
        select: {
          segmentUUID: true,
          text: true,
          startTime: true,
          endTime: true,
          TranscriptDetails: {
            orderBy: {
              score: "desc",
            },
            select: {
              Annotations: true
            }
          },
        },
      });
      return transcripts;
    }),
  saveTranscript: protectedProcedure
    .input(z.object({ segmentUUID: z.string(), text: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.transcripts.create({
        data: {
          segmentUUID: input.segmentUUID,
          text: input.text,
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
      console.log("UUID?", input.segmentUUID, "length?", input.segmentUUID?.length)
      if (!input.transcriptId && input.transcript && input.segmentUUID) {
        return await ctx.prisma.transcripts.create({
          data: {
            segmentUUID: input.segmentUUID,
            text: input.transcript,
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
        await ctx.prisma.transcriptAnnotations.deleteMany({
          where: {
            TranscriptDetails: {
              userId: ctx.session.user.id,
              transcriptId: input.transcriptId,
            },
          },
        });
        return await ctx.prisma.transcriptDetails.upsert({
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
        });
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing required data",
      });
    }),
});
