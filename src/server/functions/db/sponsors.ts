import { string } from "zod";
import { prisma } from "../../db/client";

import type {
  AnnotationTags,
  SponsorTimes,
  TranscriptAnnotations,
  TranscriptDetails,
  Transcripts,
} from "@prisma/client";

export const updateVideoSponsorsFromDB = async ({
  videoId,
}: {
  videoId: string;
}) => {
  const segments = await prisma.sponsorTimes.findMany({
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
          default:
            break;
        }
      }
    })
  );

  await prisma.$transaction(
    [...annotationinfos.entries()].map((v) =>
      prisma.sponsors.upsert({
        where: { videoId_brand: { videoId: videoId, brand: v[1].brand } },
        create: {
          videoId: videoId,
          transcriptDetailsId: v[1].transcriptDetailsId,
          brand: v[1].brand,
          product: products.get(v[1].transcriptDetailsId)?.[0],
          offer: offers.get(v[1].transcriptDetailsId)?.[0],
        },
        update: {
          transcriptDetailsId: v[1].transcriptDetailsId,
          brand: v[1].brand,
          product: products.get(v[1].transcriptDetailsId)?.[0],
          offer: offers.get(v[1].transcriptDetailsId)?.[0],
        },
      })
    )
  );
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
