import React from "react";

const VideoPageLoader = () => {
  return (
    <div className="flex flex-none flex-col gap-2 lg:w-1/3">
      <div
        id={"video_embed_placeholder"}
        className={"skeleton-box aspect-video w-full rounded-lg"}
      ></div>
      <div id="video_info_placeholder" className="px-4 sm:px-0">
        <div className="skeleton-box mb-2 h-7 w-3/4 rounded-lg"></div>
        <div className="flex items-end justify-between">
          <div className="flex gap-x-2">
            <div className="skeleton-box h-10 w-10 rounded-full"></div>
            <div className="flex flex-col gap-y-0.5">
              <div className="skeleton-box h-5 w-24 rounded-lg"></div>
              <div className="skeleton-box h-3 w-12 rounded-lg"></div>
            </div>
          </div>
          <div className="flex gap-x-2">
            <div className="skeleton-box h-3 w-10 rounded-lg"></div>
            <div className="skeleton-box h-3 w-6 rounded-lg"></div>
            <div className="skeleton-box h-3 w-8 rounded-lg"></div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-none flex-col gap-y-2 px-4 sm:px-0 ">
        <div className="skeleton-box w-full h-9 rounded-full"></div>
        <div
          id={"video_info_placeholder"}
          className={"skeleton-box h-20 w-full rounded-lg "}
        ></div>
        <div
          id={"video_sponsors_placeholder"}
          className={"skeleton-box h-20 w-full rounded-lg"}
        ></div>
      </div>
    </div>
  );
};

export default VideoPageLoader;
