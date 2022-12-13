import React from "react";
import TranscriptEditWrapper from "./edits/TranscriptEditWrapper";
import type { Segment } from "sponsorblock-api";
import useVideoCaptions from "@/hooks/useVideoCaptions";
import useSegmentTranscript from "@/hooks/useSegmentTranscript";

const GeneratedTranscripts = ({
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
  return (
    <div className="bg-blue-50 p-4">
      <span>generated</span>
      {sponsorSegmentTranscripts ? (
        <>
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
        </>
      ) : (
        <>autogen transcripts missing</>
      )}
    </div>
  );
};

export default GeneratedTranscripts;
