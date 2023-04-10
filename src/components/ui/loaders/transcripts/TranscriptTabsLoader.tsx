import React from "react";
import TranscriptLoader from "./TranscriptLoader";

const TranscriptTabsLoader = () => {
  return (
    <div className="rounded-lg border border-th-additiveBackground/10 bg-th-generalBackgroundA sm:grid sm:grid-cols-[1fr_3.2rem]">
      <div className="rounded-lg bg-th-baseBackground sm:order-2">
        <div className="relative sm:h-[25rem] sm:w-8">
          <div className="sm:pointer-events-none sm:absolute sm:top-0 sm:h-8 sm:w-[25rem] sm:origin-top-left sm:rotate-90">
            <div className="pointer-events-auto  sm:h-full sm:w-full sm:-translate-y-full ">
              <div className="flex h-full items-center py-1">
                <div className="skeleton-box ml-2 h-5 w-24 rounded-lg sm:h-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-t-th-textSecondary sm:order-1 sm:border-r sm:border-t-0 sm:border-r-th-textSecondary">
        <div className="flex min-h-[30rem] flex-col">
          <TranscriptLoader />
        </div>
      </div>
    </div>
  );
};

export default TranscriptTabsLoader;
