import React from "react";
import VideoCardLoader from "./VideoCardLoader";

const ListVideoLoader = ({ count = 10 }: { count?: number }) => {
  return (
    <div className="flex flex-col gap-2">
      {[...new Array(count)].map((i) => (
        <VideoCardLoader key={i} variant="regular" />
      ))}
    </div>
  );
};

export default ListVideoLoader;
