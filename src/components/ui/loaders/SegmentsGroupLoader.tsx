import React from "react";

const SegmentsGroupLoader = () => {
  return (
    <div className="flex flex-col gap-2">
      {[...new Array(3)].map((i) => (
        <div
          key={i}
          className={
            "h-32 w-full animate-pulse rounded-lg bg-th-additiveBackground bg-opacity-5"
          }
        ></div>
      ))}
    </div>
  );
};

export default SegmentsGroupLoader;
