import type {
  AnnotationTags,
  SponsorTimes,
  TranscriptAnnotations,
  TranscriptDetails,
  Transcripts,
} from "@prisma/client";
import { Context } from "../trpc/context";
import { CustomError } from "../common/errors";
import { inferAsyncReturnType } from "@trpc/server";


export const getVideoSponsors = async ({
  videoId,
  ctx,
}: {
  videoId: string;
  ctx: Context;
}) => {
  const segments = await ctx.prisma.sponsorTimes.findMany({
    where: {
      videoID: videoId,
      Transcripts: {
        some: { TranscriptDetails: { some: { score: { gte: 1 } } } },
      },
    },
    include: {
      Transcripts: {
        orderBy: { score: "desc" },
        take: 5,
        include: {
          TranscriptDetails: {
            orderBy: { score: "desc" },
            take: 5,
            include: { Annotations: true },
          },
        },
      },
    },
  });

  const flatPerSegmentSorted = segments.map((s) =>
    [...s.Transcripts.map((t) => t.TranscriptDetails)]
      .flat()
      .flat()
      .sort((a, b) => b.score - a.score)
  );

  const annotationinfos = new Map<
    string,
    {
      brand: string;
      product?: string;
      offer?: string;
      transcriptDetailsId: string;
    }
  >();

  const products = new Map<string, string[]>();
  const offers = new Map<string, string[]>();
  const urls = new Map<string, string[]>();
  const codes = new Map<string, string[]>();

  flatPerSegmentSorted.map((td) =>
    td?.[0]?.Annotations.forEach((annotation) => {
      const transcriptId = td?.[0]?.id;
      if (transcriptId) {
        switch (annotation.tag) {
          case "BRAND":
            annotationinfos.set(annotation.text.toUpperCase(), {
              brand: annotation.text,
              transcriptDetailsId: transcriptId,
            });
            break;
          case "PRODUCT":
            const p = products.get(transcriptId);
            products.set(
              transcriptId,
              p ? [...p, annotation.text] : [annotation.text]
            );
            break;
          case "OFFER":
            const o = offers.get(transcriptId);
            offers.set(
              transcriptId,
              o ? [...o, annotation.text] : [annotation.text]
            );
            break;
          case "URL":
            const u = urls.get(transcriptId);
            urls.set(
              transcriptId,
              u ? [...u, annotation.text] : [annotation.text]
            );
            break;
          case "CODE":
            const c = codes.get(transcriptId);
            codes.set(
              transcriptId,
              c ? [...c, annotation.text] : [annotation.text]
            );
            break;
          default:
            break;
        }
      }
    })
  );

  return [...annotationinfos.entries()].map((v) => ({
    videoId: videoId,
    transcriptDetailsId: v[1].transcriptDetailsId,
    brand: v[1].brand,
    product: products.get(v[1].transcriptDetailsId)?.[0],
    offer: offers.get(v[1].transcriptDetailsId)?.[0],
    url: urls.get(v[1].transcriptDetailsId)?.[0],
    code: codes.get(v[1].transcriptDetailsId)?.[0],
  }));
};
export type VideoSponsors = inferAsyncReturnType<typeof getVideoSponsors>;

export const updateVideoSponsorsFromDB = async ({
  videoId,
  ctx,
}: {
  videoId: string;
  ctx: Context;
}) => {
  const videoSponsors = await getVideoSponsors({ videoId, ctx });

  await ctx.prisma.$transaction([
    ctx.prisma.sponsors.deleteMany({
      where: { videoId: videoId, locked: { not: true } },
    }),
    ctx.prisma.sponsors.createMany({
      data: videoSponsors.map((s) => ({ ...s })),
      skipDuplicates: true,
    }),
  ]);
  return videoSponsors;
};

export const summarizeChannelSponsors = async ({
  channelId,
  ctx,
}: {
  channelId: string;
  ctx: Context;
}) => {
  const now = new Date();
  console.log("SUMMARIZE CHANNEL", channelId);
  const summarizeChannelProcess = await ctx.prisma.$transaction(async (tx) => {
    const pChannelSummary = await tx.processQueue.findUnique({
      where: {
        channelId_videoId_type: {
          channelId,
          type: "channel_summary",
          videoId: "",
        },
      },
    });
    if (pChannelSummary?.status === "pending") {
      const cError = new CustomError({
        message: "channel sponsor summary pending",
        type: "BOT_PENDING",
      });
      return cError;
    }
    // else if (
    //   pChannelSummary &&
    //   pChannelSummary?.lastUpdated &&
    //   pChannelSummary.status !== "error" &&
    //   pChannelSummary.lastUpdated.getTime() + 1000 * 60 * 60 * 12 <
    //     now.getTime()
    // ) {
    //   const cError = new CustomError({
    //     message: `channel sponsor summarized in last 12 hours at ${pChannelSummary.lastUpdated}`,
    //     expose: true,
    //   });
    //   return cError;
    // }
    return await tx.processQueue.upsert({
      where: {
        channelId_videoId_type: {
          channelId,
          type: "channel_summary",
          videoId: "",
        },
      },
      create: {
        channelId,
        type: "channel_summary",
        status: "pending",
        timeInitialized: new Date(),
      },
      update: {
        channelId,
        status: "pending",
        timeInitialized: new Date(),
      },
    });
  });
  if (summarizeChannelProcess instanceof CustomError)
    return summarizeChannelProcess;

  //await ctx.prisma.processQueue.upsert({where: {channelId_videoId_type: {channelId, videoId: "", type: "channel_summary"}}})
  try {
    const totalChannelVideosInDB = await ctx.prisma.videos.findMany({
      where: { Channel: { id: channelId } },
      select: { published: true },
      orderBy: { published: "desc" },
    });
    const channelVideosWithSponsors = await ctx.prisma.videos.findMany({
      where: {
        Channel: { id: channelId },
        SponsorSegments: { some: { UUID: { not: undefined } } },
      },
      include: {
        SponsorSegments: {
          select: {
            UUID: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: { published: "desc" },
    });

    const videoSponsors = Promise.allSettled(
      channelVideosWithSponsors.map(
        async (v) => await updateVideoSponsorsFromDB({ videoId: v.id, ctx })
      )
    );

    let totalSponsorSegments = 0;
    let totalSponsorTime = 0;
    for (let i = 0; i < channelVideosWithSponsors.length - 1; i++) {
      totalSponsorSegments +=
        channelVideosWithSponsors[i]?.SponsorSegments?.length ?? 0;
      channelVideosWithSponsors[i]?.SponsorSegments?.forEach(
        (ss) => (totalSponsorTime += ss.endTime - ss.startTime)
      );
    }
    const processedTo = totalChannelVideosInDB?.[0]?.published;
    if (processedTo) {
      await ctx.prisma.channelStats.upsert({
        where: { channelId_processedTo: { channelId, processedTo } },
        create: {
          channelId,
          processedTo,
          processedFrom:
            totalChannelVideosInDB?.[totalChannelVideosInDB.length - 1]
              ?.published ?? undefined,
          lastUpdated: now,
          videosProcessed: totalChannelVideosInDB.length,
          numberVideosSponsored: channelVideosWithSponsors.length,
          totalSponsorSegments,
          totalSponsorTime,
        },
        update: {
          processedFrom:
            totalChannelVideosInDB?.[totalChannelVideosInDB.length - 1]
              ?.published ?? undefined,
          lastUpdated: now,
          videosProcessed: totalChannelVideosInDB.length,
          numberVideosSponsored: channelVideosWithSponsors.length,
          totalSponsorSegments,
          totalSponsorTime,
        },
      });

      await videoSponsors;
    } else {
      throw new Error("Missing last video published date");
    }

    await ctx.prisma.processQueue.update({
      where: { id: summarizeChannelProcess.id },
      data: { status: "completed", lastUpdated: now },
    });
  } catch (err) {
    console.error("channel summarize err", err);
    await ctx.prisma.processQueue.update({
      where: { id: summarizeChannelProcess.id },
      data: { status: "error", lastUpdated: now },
    });
  }
};

function aggregrateTopScores(
  segments: (SponsorTimes & {
    Transcripts: (Transcripts & {
      TranscriptDetails: (TranscriptDetails & {
        Annotations: TranscriptAnnotations[];
      })[];
    })[];
  })[]
) {
  const sponsors = new Map<
    string,
    {
      score: number;
      brands: string[];
      products: string[];
      offers: string[];
    }
  >();

  const rankMap = (myMap: Map<any, number>) => {
    return [...myMap.entries()].sort((a, b) => b[1] - a[1]);
  };

  //we assume 1 brand/product/offer per segment
  console.log("SEGMENTS?", segments);
  segments.forEach((segment) => {
    const brandscore = new Map<string, number>();
    const productscore = new Map<string, number>();
    const offerscore = new Map<string, number>();
    segment.Transcripts.forEach((transcript) => {
      let score = transcript.score;
      console.log("score1?", score, transcript.id);
      transcript.TranscriptDetails.forEach((details) => {
        score = score + details.score;
        console.log("score2?", score, transcript.id, details.id);

        details.Annotations.forEach((annotation) => {
          switch (annotation.tag) {
            case "BRAND":
              brandscore.set(annotation.text.toUpperCase(), score);
            case "PRODUCT":
              productscore.set(annotation.text.toUpperCase(), score);
            case "OFFER":
              offerscore.set(annotation.text.toUpperCase(), score);
            default:
              break;
          }
        });
      });
    });

    const brandsranked = rankMap(brandscore);
    const productsranked = rankMap(productscore);
    const offersranked = rankMap(offerscore);
    console.log("BRANDS?", brandsranked, productsranked, offersranked);

    sponsors.set(brandsranked?.[0]?.[0], {
      score: brandsranked?.[0]?.[1] ?? 0,
      brands: brandsranked.map((b) => b[0]),
      products: productsranked.map((p) => p[0]),
      offers: offersranked.map((o) => o[0]),
    });
  });
  console.log("SPONSORS??", sponsors);
}
