import React from "react";
import TopBarLoader from "./TopBarLoader";
import TranscriptTextLoader from "./TranscriptTextLoader";

const TranscriptLoader = () => {
  return (
    <div className="flex flex-col flex-grow">
      <TopBarLoader />
      <TranscriptTextLoader />
    </div>
  );
};

export default TranscriptLoader;
