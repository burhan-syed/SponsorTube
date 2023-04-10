import React from "react";
import TranscriptTabsLoader from "./TranscriptTabsLoader";

const SegmentsGroupLoader = () => {
  return (
    <div className="flex flex-col gap-2">
      {[...new Array(1)].map((i) => (
        <TranscriptTabsLoader key={i} />
      ))}
    </div>
  );
};

export default SegmentsGroupLoader;
