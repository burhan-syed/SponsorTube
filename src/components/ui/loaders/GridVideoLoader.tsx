import React from "react";
import VideoCardLoader from "./VideoCardLoader";

const GridVideoLoader = ({ count = 10 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {[...new Array(count)].map((a,i) => (
        <VideoCardLoader key={i} variant="compact" />
      ))}
    </div>
  );
};

export default GridVideoLoader;
