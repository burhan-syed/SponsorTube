import React from "react";

const VideoPageLoader = () => {
  return (
    <div className="flex flex-none flex-col lg:w-1/3 gap-2">
      <div
        id={"video_embed_placeholder"}
        className={
          "aspect-video w-full skeleton-box rounded-lg"
        }
      ></div>
      <div
        id={"video_info_placeholder"}
        className={
          "h-20 w-full skeleton-box rounded-lg "
        }
      ></div>
    </div>
  );
};

export default VideoPageLoader;
