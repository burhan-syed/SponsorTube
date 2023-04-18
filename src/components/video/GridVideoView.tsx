import React from "react";
import VideoCard from "./VideoCard";
import type { VideoCardInfo } from "@/types/schemas";
import VideoCardLoader from "../ui/loaders/VideoCardLoader";

const GridVideoView = ({
  videos,
  showLoading = 0,
}: {
  videos: VideoCardInfo[];
  showLoading?: number;
}) => {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} variant="compact" />
      ))}
      {showLoading > 0 ? (
        [...new Array(showLoading)].map((a, i) => (
          <VideoCardLoader key={i} variant="compact" />
        ))
      ) : (
        <></>
      )}
    </div>
  );
};

export default GridVideoView;
