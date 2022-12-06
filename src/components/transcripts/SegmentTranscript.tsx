import React from "react";
import { trpc } from "@/utils/trpc";

import useSegmentTranscript from "@/hooks/useSegmentTranscript";
import useVideoCaptions from "@/hooks/useVideoCaptions";

import type { Segment } from "sponsorblock-api";
import TranscriptEditor from "./TranscriptEditor";
import TranscriptAnnotator from "./TranscriptAnnotator";
import TranscriptEditWrapper from "./TranscriptEditWrapper";
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
                  <TranscriptAnnotator
                    key={savedTranscripts.id}
                    transcript={{
                      segmentUUID: segment.UUID,
                      text: savedTranscripts.text,
                      annotations:
                        savedTranscripts?.TranscriptDetails?.[0]?.Annotations,
                      id: savedTranscripts.id,
                    }}
                  />
                  <TranscriptEditWrapper
                    segmentUUID={segment.UUID}
                    transcript={savedTranscripts?.text}
                  />
                </>
              ))}
            </div>
            <div className="bg-blue-50 p-4">
              <span>generated</span>
              <TranscriptAnnotator
                transcript={{
                  segmentUUID: segment.UUID,
                  text: sponsorSegmentTranscripts.transcript,
                }}
              />
              <TranscriptEditWrapper
                segmentUUID={segment.UUID}
                transcript={sponsorSegmentTranscripts.transcript}
              />
            </div>
            <span>
              {sponsorSegmentTranscripts.transcriptStart}:
              {sponsorSegmentTranscripts.transcriptEnd}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default SegmentTranscript;
