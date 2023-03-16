import { AnnotationTags, TranscriptAnnotations } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  checkAnnotationBadWords,
  filterTranscriptBadWords,
} from "../functions/badwords";
import { saveVideoDetails } from "./videos";
import { isUserABot } from "./bots";
import { md5 } from "../functions/hash";
import type { Context } from "../trpc/context";
import type VideoInfo from "youtubei.js/dist/src/parser/youtube/VideoInfo";
import { CustomError } from "../common/errors";

const AnnotationsSchema = z.array(
  z.object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
    tag: z.nativeEnum(AnnotationTags),
  })
);

export const SaveTranscriptSchema = z.object({
  segmentUUID: z.string(),
  text: z.string(),
  startTime: z.number().nullish(),
  endTime: z.number().nullish(),
});

export const SaveAnnotationsSchema = z.object({
  segment: z.object({
    UUID: z.string(),
  }),
  transcript: z.string(),
  transcriptId: z.string().nullish(),
  transcriptDetailsId: z.string().nullish(),
  startTime: z.number().nullish(),
  endTime: z.number().nullish(),
  annotations: AnnotationsSchema,
  videoId: z.string(),
});

export const VoteTranscriptDetailsSchema = z.object({
  transcriptDetailsId: z.string(),
  previous: z.number(),
  direction: z.number(),
  transcriptId: z.string(),
});

export const GetUserVoteSchema = z.object({ transcriptDetailsId: z.string() });

type AnnotationsType = z.infer<typeof AnnotationsSchema>;
type SaveTranscriptType = z.infer<typeof SaveTranscriptSchema>;
type SaveAnnotationsInputType = z.infer<typeof SaveAnnotationsSchema>;
type VoteTranscriptDetailsType = z.infer<typeof VoteTranscriptDetailsSchema>;
type GetUserVoteType = z.infer<typeof GetUserVoteSchema>;
export const getUserVote = async ({
  input,
  ctx,
}: {
  input: GetUserVoteType;
  ctx: Context;
}) => {
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
};

export const updateUserTranscriptDetailsVote = async ({
  input,
  ctx,
}: {
  input: VoteTranscriptDetailsType;
  ctx: Context;
}) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
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
};

export const saveTranscript = async ({
  input,
  ctx,
}: {
  input: SaveTranscriptType;
  ctx: Context;
}) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      cause: new CustomError({ level: "COMPLETE", message: "Unauthorized" }),
    });
  }
  const cleaned = filterTranscriptBadWords(input.text);
  if (!cleaned) {
    throw new TRPCError({
      message: "Invalid transcript. Check for profanity.",
      code: "BAD_REQUEST",
      cause: new CustomError({
        message: "Invalid transcript. Check for profanity.",
        expose: true,
        level: "COMPLETE",
      }),
    });
  }
  const textHash = md5(cleaned);
  const create = await ctx.prisma?.transcripts.upsert({
    where: {
      segmentUUID_textHash: { segmentUUID: input.segmentUUID, textHash },
    },
    update: {},
    create: {
      segmentUUID: input.segmentUUID,
      text: cleaned,
      textHash: textHash,
      userId: ctx.session.user.id,
      startTime: input.startTime,
      endTime: input.endTime,
    },
  });
};

export const saveAnnotationsAndTranscript = async ({
  input,
  ctx,
  inputVideoInfo,
}: {
  input: SaveAnnotationsInputType;
  ctx: Context;
  inputVideoInfo?: VideoInfo;
}) => {
  // console.log("SAVING ANNOTATIONS AND TRANSCRIPT", {
  //   videoId: input.videoId,
  //   transcriptDetailsId: input.transcriptDetailsId,
  //   transcriptId: input.transcriptId,
  //   transcript: input.transcript.length,
  //   annotationsNum: input.annotations.length,
  //   videoInfoIncluded: !!inputVideoInfo,
  // });

  if (!ctx.session || !ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (!input.annotations || !input.annotations.find((a) => a.tag === "BRAND")) {
    const message = "A brand must be identified";
    const cError = new CustomError({
      message,
      expose: true,
      type: "",
    });
    throw new TRPCError({
      code: "BAD_REQUEST",
      message,
      cause: cError,
    });
  }
  input.annotations.forEach((annotation) => {
    if (checkAnnotationBadWords(annotation.text)) {
      const message = "Invalid annotations. Check for Profanity.";
      const cError = new CustomError({
        message,
        expose: true,
        type: "",
      });
      throw new TRPCError({
        code: "BAD_REQUEST",
        message,
        cause: cError,
      });
    }
  });

  const saveVideo = saveVideoDetails({
    input: { segmentIDs: [input.segment.UUID], videoId: input.videoId },
    ctx,
    inputVideoInfo,
  });

  const cleaned = filterTranscriptBadWords(input.transcript);
  if (!cleaned) {
    const message = "Invalid transcript. Check for profanity.";
    const cError = new CustomError({
      message,
      expose: true,
      type: "",
    });
    throw new TRPCError({
      code: "BAD_REQUEST",
      message,
      cause: cError,
    });
  }
  const textHash = md5(cleaned);

  const duplicates = await findDuplicateAnnotations({
    ctx: ctx,
    annotations: input.annotations,
    textHash,
    segmentUUID: input.segment.UUID,
  });

  try {
    await findCompleteMatchingTranscriptDetailsAndVote({
      duplicates,
      annotations: input.annotations,
      ctx,
    });
  } catch (error) {
    //continue to save video if duplicate found and bot request
    if (
      error instanceof TRPCError &&
      error.code === "PRECONDITION_FAILED" &&
      (await isUserABot({ ctx }))
    ) {
      await saveVideo;
    } else {
      throw error;
    }
  }

  const upsertTranscriptAndUserTranscriptAnnotations = async ({
    transcriptDetailsId,
    transcriptId,
    userId,
  }: {
    transcriptDetailsId: string;
    transcriptId: string;
    userId: string;
  }) => {
    const update = await ctx.prisma.$transaction([
      ctx.prisma.transcriptAnnotations.deleteMany({
        where: {
          TranscriptDetails: {
            userId: userId,
            transcriptId: transcriptId,
          },
        },
      }),

      ctx.prisma.transcriptDetails.upsert({
        where: {
          transcriptId_userId: {
            transcriptId: transcriptId,
            userId: userId,
          },
          // id: input.transcriptDetailsId, //redundant
        },
        create: {
          transcriptId: transcriptId,
          userId: userId,
          score: 1,
          Annotations: {
            createMany: { data: input.annotations },
          },
          Votes: {
            create: {
              userId: userId,
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
                  userId: userId,
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
                    userId: userId,
                    transcriptId: transcriptId,
                  },
                  direction: -1,
                  // userId: { not: ctx.session.user.id },
                },
              })) -
              (await ctx.prisma.userTranscriptDetailsVotes.count({
                where: {
                  TranscriptDetails: {
                    userId: userId,
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
          userId: { not: userId },
        },
      }),
    ]);
    return update[1];
  };

  //provided segment and transcript text
  if (input.transcript && input.segment.UUID) {
    const transcriptDetailsIdPromise = async ({ userId }: { userId: string }) =>
      input?.transcriptDetailsId ??
      (
        await ctx.prisma.transcriptDetails.findFirst({
          where: {
            Transcript: { segmentUUID: input.segment.UUID, textHash },
            userId: userId,
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

    //find the existing transcriptdetailsId & transcriptId
    const [transcriptDetailsId, transcriptId] = await Promise.all([
      transcriptDetailsIdPromise({ userId: ctx.session.user.id }),
      transcriptIdPromise(),
    ]);

    //existing transcript details
    if (transcriptDetailsId && transcriptId) {
      // console.log("FOUND EXISTING TRANSCRIPT DETAILS", {
      //   UUID: input.segment.UUID,
      //   transcriptDetailsId,
      // });
      const r = await upsertTranscriptAndUserTranscriptAnnotations({
        transcriptDetailsId,
        transcriptId,
        userId: ctx.session.user.id,
      });
      await saveVideo;
      return r;
    }
    //new transcript or user transcript annotations
    //console.log("NEW TRANSCRIPT DETAILS", { UUID: input.segment.UUID });
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
    // console.log("USING EXISTING TRANSCRIPT DETAILS", {
    //   UUID: input.segment.UUID,
    //   transcriptDetailsID: input.transcriptDetailsId,
    // });
    const r = await upsertTranscriptAndUserTranscriptAnnotations({
      transcriptId: input.transcriptId,
      transcriptDetailsId: input.transcriptDetailsId,
      userId: ctx.session.user.id,
    });
    await saveVideo;
    return r;
  }

  const cError = new CustomError({
    message: "Missing required data",
    expose: true,
    level: "COMPLETE",
  });
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Missing required data",
    cause: cError,
  });
};

async function findDuplicateAnnotations({
  ctx,
  annotations,
  textHash,
  segmentUUID,
}: {
  ctx: Context;
  annotations: AnnotationsType;
  textHash: string;
  segmentUUID: string;
}) {
  const isBot = await isUserABot({ ctx });

  const duplicates = await ctx.prisma.$transaction(
    annotations.map((a) =>
      ctx.prisma.transcriptAnnotations.findMany({
        where: {
          ...a,
          TranscriptDetails: {
            Transcript: {
              segmentUUID: segmentUUID,
              textHash: textHash,
            },
            userId: isBot ? ctx.session?.user?.id : undefined,
          },
        },
        include: {
          TranscriptDetails: {
            select: {
              transcriptId: true,
            },
          },
        },
      })
    )
  );
  //console.log("SUBMITTED?", annotations);
  //console.log("DUPLICATES?", duplicates);
  return duplicates;
}

async function findCompleteMatchingTranscriptDetailsAndVote({
  duplicates,
  annotations,
  ctx,
}: {
  duplicates: (TranscriptAnnotations & {
    TranscriptDetails: {
      transcriptId: string;
    };
  })[][];
  annotations: AnnotationsType;
  ctx: Context;
}) {
  const matchingTranscriptDetailsIds = new Map<
    string,
    { annotationIndex: number; count: number; transcriptId: string }
  >();
  duplicates.forEach((d, i) => {
    d.forEach((t, j) => {
      const prev = matchingTranscriptDetailsIds.get(t.transcriptDetailsId);
      matchingTranscriptDetailsIds.set(t.transcriptDetailsId, {
        annotationIndex: i,
        transcriptId: t.TranscriptDetails.transcriptId,
        count: prev
          ? prev.annotationIndex !== i
            ? (prev.count += 1)
            : prev.count
          : 1,
      });
    });
  });

  await Promise.all(
    [...matchingTranscriptDetailsIds.entries()].map(async (o) => {
      const v = o[1];
      const k = o[0];
      if (v.count === annotations.length) {
        //console.log("DUPLICATE MATCH", v);
        const pVote = await getUserVote({
          input: { transcriptDetailsId: k },
          ctx,
        });
        if (pVote.direction !== 1) {
          await updateUserTranscriptDetailsVote({
            input: {
              transcriptDetailsId: k,
              direction: 1,
              previous: pVote.direction,
              transcriptId: v.transcriptId,
            },
            ctx,
          });
        }

        const message = `These annotations were previously submitted. An upvote was placed on the previous annotations.`;
        const cError = new CustomError({ message, expose: true });
        throw new TRPCError({
          message,
          code: "PRECONDITION_FAILED",
          cause: cError,
        });
      }
    })
  );
}
