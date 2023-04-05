import React from "react";

const ChannelHeaderLoader = () => {
  return (
    <div className="flex w-full flex-none flex-col items-center gap-2 md:flex-row md:gap-7">
      <div className="skeleton-box h-14 w-14 flex-none overflow-hidden rounded-full md:h-32 md:w-32"></div>
      <div className="flex w-full flex-col items-center gap-y-2 md:flex-grow md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-center gap-1 md:items-start md:gap-2">
          <span className="flex items-center gap-2 text-2xl font-semibold">
            <div className="skeleton-box h-[3rem] w-56 rounded-lg"></div>
          </span>
          <ul className="flex flex-wrap space-x-2 text-xs text-th-textSecondary md:text-sm">
            <li className="skeleton-box h-[1.2rem] w-10 rounded-3xl md:h-[1.4rem]"></li>
            <li className="skeleton-box h-[1.2rem] w-10 rounded-3xl md:h-[1.4rem]"></li>
            <li className="skeleton-box h-[1.2rem] w-10 rounded-3xl md:h-[1.4rem]"></li>
          </ul>
        </div>
        <div className="h-10 md:h-24"></div>
        <div className="flex w-full gap-2 md:w-auto">
          <div className="skeleton-box h-9 w-full rounded-full md:w-44"></div>
          <div className="skeleton-box h-9 w-9 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ChannelHeaderLoader;
