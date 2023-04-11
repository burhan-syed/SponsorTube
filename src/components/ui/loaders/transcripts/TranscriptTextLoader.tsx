import React from "react";

const TranscriptTextLoader = () => {
  return (
    <div className=" flex flex-grow flex-col gap-3 p-2 pt-4 opacity-50">
      {[...new Array(5)].map((a, i) => (
        <div
          className="skeleton-box h-4 w-full rounded-lg last:w-3/4"
          key={i}
        ></div>
      ))}
    </div>
  );
};

export default TranscriptTextLoader;
