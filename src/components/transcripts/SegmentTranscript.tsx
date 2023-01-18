import React from "react";
import TranscriptTabs from "./TranscriptTabs";

import type { Segment } from "sponsorblock-api";
const SegmentTranscript = ({
  segment,
  captionsURL,
  seekTo,
}: {
  segment: Segment;
  captionsURL: string;
  seekTo(start: number, end: number): void;
}) => {
  return (
    <>
      <TranscriptTabs
        key={segment.UUID}
        segment={segment}
        captionsURL={captionsURL}
        seekTo={seekTo}
      />
    </>
  );
};

export default SegmentTranscript;
