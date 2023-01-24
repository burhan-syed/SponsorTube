import React from "react";
import TranscriptTabs from "./TranscriptTabs";

import type { Segment } from "sponsorblock-api";
const SegmentTranscript = ({
  segment,
  videoID,
  captionsURL,
  seekTo,
}: {
  segment: Segment;
  videoID: string;
  captionsURL: string;
  seekTo(start: number, end: number): void;
}) => {
  return (
    <>
      <TranscriptTabs
        key={segment.UUID}
        videoID={videoID}
        segment={segment}
        captionsURL={captionsURL}
        seekTo={seekTo}
      />
    </>
  );
};

export default SegmentTranscript;
