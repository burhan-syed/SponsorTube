import React from "react";
import { trpc } from "@/utils/trpc";

import useSegmentTranscript from "@/hooks/useSegmentTranscript";
import useVideoCaptions from "@/hooks/useVideoCaptions";

import type { Segment } from "sponsorblock-api";
import TranscriptEditor from "./TranscriptEditor";
import TranscriptAnnotator from "./TranscriptAnnotator";
import TranscriptEditWrapper from "./TranscriptEditWrapper";
import TranscriptVote from "./TranscriptVote";
const SegmentTranscript = ({
  segment,
  captionsURL,
}: {
  segment: Segment;
  captionsURL: string;
}) => {
  const captions = useVideoCaptions({
    captionsURL: captionsURL,
  });
  const sponsorSegmentTranscripts = useSegmentTranscript({
    videoCaptions: captions.data,
    sponsorSegment: segment,
  });
  const savedTranscriptAnnotations = trpc.transcript.get.useQuery(
    {
      segmentUUID: segment?.UUID,
    },
    {
      enabled: !!segment.UUID,
    }
  );
  console.log("saved segment transcripts?", savedTranscriptAnnotations.data);
  return (
    <div>
      {savedTranscriptAnnotations.isLoading
        ? "waiting for db transcripts.."
        : savedTranscriptAnnotations?.data
        ? `db transcripts: ${savedTranscriptAnnotations.data?.length}`
        : savedTranscriptAnnotations.error
        ? "error fetching db transcripts"
        : "something went wrong fetching db transcripts"}
      {sponsorSegmentTranscripts && (
        <>
          <div className="rounded-3xl p-2" key={sponsorSegmentTranscripts.UUID}>
            <h3>{sponsorSegmentTranscripts.UUID}</h3>
            {/* <p onMouseUp={() => console.log(window.getSelection()?.toString())}>
              {sponsorSegmentTranscripts?.runs?.join("\n")}
            </p> */}
            <div className="bg-green-50 p-4">
              <span>saved</span>
              {savedTranscriptAnnotations?.data?.map((savedTranscripts) => (
                <>
                  {/* <TranscriptAnnotator
                    key={savedTranscripts.id}
                    transcript={{
                      segmentUUID: segment.UUID,
                      text: savedTranscripts.text,
                      annotations:
                        savedTranscripts?.TranscriptDetails?.[0]?.Annotations,
                      id: savedTranscripts.id,
                    }}
                  /> */}
                  {`(details id: ${savedTranscripts.TranscriptDetails?.[0]?.id} [${savedTranscripts.TranscriptDetails?.[0]?.score} | ${savedTranscripts.score}])`}
                  {savedTranscripts.TranscriptDetails?.[0]?.id && (
                    <TranscriptVote
                      transcriptDetailsId={
                        savedTranscripts.TranscriptDetails?.[0]?.id
                      }
                      initialDirection={
                        savedTranscripts.TranscriptDetails?.[0]?.Votes?.[0]
                          ?.direction ?? 0
                      }
                      transcriptId={savedTranscripts.id}
                    />
                  )}

                  <TranscriptEditWrapper
                    key={savedTranscripts.id}
                    transcript={{
                      segmentUUID: segment.UUID,
                      text: savedTranscripts.text,
                      startTime: savedTranscripts?.startTime,
                      endTime: savedTranscripts?.endTime,
                      annotations:
                        savedTranscripts?.TranscriptDetails?.[0]?.Annotations,
                      id: savedTranscripts.id,
                      transcriptDetailsId:
                        savedTranscripts.TranscriptDetails?.[0]?.id,
                    }}
                  />
                  <span>
                    {savedTranscripts.startTime}:{savedTranscripts.endTime}
                  </span>
                  {/* <TranscriptEditWrapper
                    segmentUUID={segment.UUID}
                    transcript={savedTranscripts?.text}
                  /> */}
                </>
              ))}
            </div>
            <div className="bg-blue-50 p-4">
              <span>generated</span>
              <TranscriptEditWrapper
                key={`${segment.UUID}_default`}
                transcript={{
                  segmentUUID: segment.UUID,
                  text: sponsorSegmentTranscripts.transcript,
                  startTime: sponsorSegmentTranscripts.transcriptStart,
                  endTime: sponsorSegmentTranscripts.transcriptEnd,
                }}
              />
              <span>
                {sponsorSegmentTranscripts.transcriptStart}:
                {sponsorSegmentTranscripts.transcriptEnd}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SegmentTranscript;
