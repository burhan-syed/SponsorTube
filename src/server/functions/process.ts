import { getVideoSegments } from "@/apis/sponsorblock";
import { getVideoInfoFormatted } from "../db/videos";
import { getXMLCaptions } from "./captions";
import { getTranscriptsInTime } from "./transcripts";
import { getSegmentAnnotationsOpenAICall } from "../db/bots";
import { Context } from "../trpc/context";
import { updateVideoSponsorsFromDB } from "../db/sponsors";
import type { GetSegmentAnnotationsType } from "../db/bots";

const SERVER_URL = process.env.NEXTAUTH_URL; 

export const processVideo = async ({
  videoId,
  ctx,
  options,
}: {
  videoId: string;
  ctx: Context;
  options?: {
    callServer: boolean;
  };
}) => {
  const videoInfo = await getVideoInfoFormatted({
    input: { videoID: videoId },
  });
  const englishCaptionTracks = videoInfo?.captions.caption_tracks?.filter(
    (t) => t.language_code === "en" || t.language_code === "en-US"
  );
  if (!englishCaptionTracks?.[0]?.base_url) {
    throw new Error("no english captions found");
  }
  const [captions, segments] = await Promise.all([
    getXMLCaptions(englishCaptionTracks[0].base_url),
    getVideoSegments({
      userID: ctx.session?.user?.id ?? "sponsortubebot",
      videoID: videoId,
    }),
  ]);

  const segmentTranscripts = segments.map((s) => ({
    segment: { ...s },
    ...getTranscriptsInTime({
      transcripts: captions,
      times: { startTimeMS: s.startTime, endTimeMS: s.endTime },
    }),
  }));

  if (options?.callServer) {
    segmentTranscripts.forEach((st) =>
      callServerSegmentAnnotationsOpenAICall({
        segment: st.segment,
        transcript: st.transcript,
        startTime: st.transcriptStart,
        endTime: st.transcriptEnd,
        videoId: videoId,
      })
    );
  } else {
    try {
      await Promise.all([
        ...segmentTranscripts.map(
          async (st) =>
            await getSegmentAnnotationsOpenAICall({
              input: {
                segment: st.segment,
                transcript: st.transcript,
                startTime: st.transcriptStart,
                endTime: st.transcriptEnd,
                videoId: videoId,
              },
              ctx: ctx,
            })
        ),
      ]);
    } catch (err) {
      console.log("ERROR?", err);
    }
    await updateVideoSponsorsFromDB({ videoId: videoId });
  }
};

export const callServerSegmentAnnotationsOpenAICall = async (
  input: GetSegmentAnnotationsType
) => {
  console.log("posting ", input?.videoId, input.startTime)
  const JSONdata = JSON.stringify(input);
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSONdata,
  };
  const res = await fetch(`${SERVER_URL}/api/botrequest`, options);
  return;
};
