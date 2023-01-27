import React from "react";

const TranscriptTextLoader = () => {
  return (
    <div className=" flex flex-col flex-grow gap-3 p-2 opacity-50 pt-4">
      {[...new Array(5)].map((i) => (
        <div
          className="skeleton-box h-4 w-full rounded-lg last:w-3/4"
          key={1}
        ></div>
      ))}
    </div>
  );
};

export default TranscriptTextLoader;
