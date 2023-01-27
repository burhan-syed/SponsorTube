import React from "react";

const SegmentsGroupLoader = () => {
  return (
    <div className="flex flex-col gap-2">
      {[...new Array(3)].map((i) => (
        <div key={i} className={"skeleton-box h-32 w-full rounded-lg"}></div>
      ))}
    </div>
  );
};

export default SegmentsGroupLoader;
