import React from "react";
import TranscriptTabs from "./TranscriptTabs";

import type { Segment } from "sponsorblock-api";
const SegmentTranscript = ({
  segment,
  captionsURL,
}: {
  segment: Segment;
  captionsURL: string;
}) => {
  return (
    <div>
      <>
        <div className="rounded-3xl p-2" key={segment.UUID}>
          <h3>{segment.UUID}</h3>
          <TranscriptTabs segment={segment} captionsURL={captionsURL} />
        </div>
      </>
    </div>
  );
};

export default SegmentTranscript;
