import { CustomError } from "../common/errors";
import { inferAsyncReturnType } from "@trpc/server";
import type {
  AnnotationTags,
  PrismaClient,
  SponsorTimes,
  TranscriptAnnotations,
  TranscriptDetails,
  Transcripts,
} from "@prisma/client";
import type { Context } from "@/server/api/trpc";

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
        where: { score: { gte: 1 } },
        orderBy: { score: "desc" },
        take: 5,
        include: {
          TranscriptDetails: {
            where: { score: { gte: 1 } },
            orderBy: { score: "desc" },
            take: 5,
            include: { Annotations: true },
          },
        },
      },
    },
  });

  //console.log("found?", JSON.stringify(segments, null, 2));

  const flatPerSegmentSorted = segments.map(
    (s) =>
      [...s.Transcripts.map((t) => t.TranscriptDetails)]
        .flat()
        .flat()
        .sort((a, b) =>
          b.score - a.score === 0
            ? b.created.getTime() - a.created.getTime()
            : b.score - a.score
        ) //only the first transcript details for any transcript is evaluated. If tied in score take the latest
  );

  //console.log("sorted?", JSON.stringify(flatPerSegmentSorted, null, 2));

  // const annotationinfos = new Map<
  //   string,
  //   {
  //     brand: string;
  //     product?: string;
  //     offer?: string;
  //     transcriptDetailsId: string;
  //   }
  // >();

  //
  const brands = new Map<string, string[]>();
  const products = new Map<string, string[]>();
  const offers = new Map<string, string[]>();
  const urls = new Map<string, string[]>();
  const codes = new Map<string, string[]>();
  flatPerSegmentSorted.map((td) =>
    //only take the top scoring+latest transcriptdetails per segment
    td?.[0]?.Annotations.forEach((annotation) => {
      const transcriptDetailsId = td?.[0]?.id;
      if (transcriptDetailsId) {
        switch (annotation.tag) {
          case "BRAND":
            // annotationinfos.set(annotation.text.toUpperCase(), {
            //   brand: annotation.text,
            //   transcriptDetailsId: transcriptDetailsId,
            // });
            const b = brands.get(transcriptDetailsId);
            brands.set(
              transcriptDetailsId,
              b ? [...b, annotation.text] : [annotation.text]
            );
            break;
          case "PRODUCT":
            const p = products.get(transcriptDetailsId);
            products.set(
              transcriptDetailsId,
              p ? [...p, annotation.text] : [annotation.text]
            );
            break;
          case "OFFER":
            const o = offers.get(transcriptDetailsId);
            offers.set(
              transcriptDetailsId,
              o ? [...o, annotation.text] : [annotation.text]
            );
            break;
          case "URL":
            const u = urls.get(transcriptDetailsId);
            urls.set(
              transcriptDetailsId,
              u ? [...u, annotation.text] : [annotation.text]
            );
            break;
          case "CODE":
            const c = codes.get(transcriptDetailsId);
            codes.set(
              transcriptDetailsId,
              c ? [...c, annotation.text] : [annotation.text]
            );
            break;
          default:
            break;
        }
      }
    })
  );

  //only the first brand/product/offer/url/code is taken per transcript
  const rawmap = [...brands.entries()]
    .filter((b) => b[1]?.[0])
    .map((b) => ({
      videoId: videoId,
      transcriptDetailsId: b[0],
      brand: b[1][0] ?? "",
      product: products.get(b[0])?.[0],
      offer: offers.get(b[0])?.[0],
      url: urls.get(b[0])?.[0],
      code: codes.get(b[0])?.[0],
    }));
  const filtermap = rawmap
    //filter brands with no info if its already accounted for
    .filter(
      (a) =>
        !(!(a.product || a.offer || a.url || a.code) &&
        rawmap.some(
          (r) =>
            r.brand === a.brand && (r.product || r.offer || r.url || r.code)
        ))
    );

  // const old = [...annotationinfos.entries()].map((v) => ({
  //   videoId: videoId,
  //   transcriptDetailsId: v[1].transcriptDetailsId,
  //   brand: v[1].brand,
  //   product: products.get(v[1].transcriptDetailsId)?.[0],
  //   offer: offers.get(v[1].transcriptDetailsId)?.[0],
  //   url: urls.get(v[1].transcriptDetailsId)?.[0],
  //   code: codes.get(v[1].transcriptDetailsId)?.[0],
  // }));

  // console.log("?", {
  //   brands,
  //   products,
  //   offers,
  //   urls,
  //   codes,
  //   filtermap,
  // });

  return filtermap;
};
export type VideoSponsors = inferAsyncReturnType<typeof getVideoSponsors>;

export const updateVideoSponsorsFromDB = async ({
  videoId,
  ctx,
  suppliedVideoSponsors,
}: {
  videoId: string;
  ctx: Context;
  suppliedVideoSponsors?: VideoSponsors;
}) => {
  const videoSponsors = suppliedVideoSponsors
    ? suppliedVideoSponsors
    : await getVideoSponsors({ videoId, ctx });

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

export const compareAndUpdateVideoSponsors = async ({
  videoId,
  prisma,
}: {
  videoId: string;
  prisma: PrismaClient;
}) => {
  const [videoSponsors, savedSponsors] = await Promise.all([
    getVideoSponsors({ videoId: videoId, ctx: { prisma, session: null } }),
    prisma.sponsors.findMany({ where: { videoId } }),
  ]);

  const isDifferent =
    !savedSponsors.some((s) => s.locked) &&
    videoSponsors?.length > 0 &&
    (savedSponsors.length !== videoSponsors.length ||
      //check for any video sponsors not in the saved sponsors
      videoSponsors.some((v) => {
        return !savedSponsors.some((s) => {
          //string copy these objects ignoring id, and locked
          const sCopy: { [x: string]: any } = { ...s, id: "", locked: false };
          const vCopy: { [x: string]: any } = { ...v, id: "", locked: false };
          //cleanup null/undefined values for string compare
          Object.keys(sCopy).forEach(
            (key) => !!!sCopy[key] && delete sCopy[key]
          );
          Object.keys(vCopy).forEach(
            (key) => !!!vCopy[key] && delete vCopy[key]
          );

          console.log(
            "compare?",
            JSON.stringify(vCopy, null, 2),
            JSON.stringify(sCopy, null, 2),
            JSON.stringify(sCopy) === JSON.stringify(vCopy)
          );
          return JSON.stringify(sCopy) === JSON.stringify(vCopy);
        });
      }));

  if (isDifferent) {
    console.log("isdifferent", videoSponsors, savedSponsors);
    updateVideoSponsorsFromDB({
      videoId,
      ctx: { prisma, session: null },
      suppliedVideoSponsors: videoSponsors,
    });
  } else {
    console.log("isnotdifferent", videoSponsors, savedSponsors);
  }
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

    //TODO: chunk these to limit db connections
    const videoSponsors = Promise.allSettled(
      channelVideosWithSponsors.map(
        async (v) =>
          await compareAndUpdateVideoSponsors({
            videoId: v.id,
            prisma: ctx.prisma,
          })
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
