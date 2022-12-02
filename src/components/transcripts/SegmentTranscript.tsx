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

            <TranscriptAnnotator
              key={segment.UUID}
              transcript={{
                segmentUUID: segment.UUID,
                text: savedTranscriptAnnotations.data?.[0]?.text ?? sponsorSegmentTranscripts.transcript,
                annotations:
                  savedTranscriptAnnotations.data?.[0]?.TranscriptDetails?.[0]
                    ?.Annotations,
                id: savedTranscriptAnnotations.data?.[0]?.id,
              }}
            />
            <span>
              {sponsorSegmentTranscripts.transcriptStart}:
              {sponsorSegmentTranscripts.transcriptEnd}
            </span>
          </div>
          <TranscriptEditWrapper
            key={segment.UUID}
            segmentUUID={segment.UUID}
            transcript={savedTranscriptAnnotations.data?.[0]?.text ?? sponsorSegmentTranscripts.transcript}
          />
          {/* <TranscriptEditor
            key={segment.UUID}
            transcript={sponsorSegmentTranscripts?.transcript ?? ""}
          /> */}
        </>
      )}
    </div>
  );
};

export default SegmentTranscript;
