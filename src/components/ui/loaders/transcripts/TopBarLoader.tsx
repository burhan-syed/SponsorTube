import React from "react";

const TopBarLoader = () => {
  return (
    <div className="flex items-start justify-end gap-1 rounded-tl-lg bg-th-baseBackground px-1 py-1 sm:translate-x-0 sm:flex-row sm:justify-start sm:gap-2 sm:px-2 sm:py-0.5">
      <div className="flex items-center gap-2">
        <div className="skeleton-box h-9 w-9 rounded-full"></div>
        <div className="skeleton-box h-3 w-20 rounded-lg"></div>
      </div>

      <div className="mx-auto"></div>

      <div className="skeleton-box h-9 w-9 rounded-full"></div>
      <div className="skeleton-box h-9 w-9 rounded-full"></div>
      <div className="skeleton-box h-9 w-9 rounded-full"></div>
    </div>
  );
};

export default TopBarLoader;
