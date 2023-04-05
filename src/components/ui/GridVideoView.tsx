import React from "react";
import VideoCard from "./VideoCard";
import type { VideoCardInfo } from "@/types/schemas";

const GridVideoView = ({ videos }: { videos: VideoCardInfo[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} variant="compact" />
      ))}
    </div>
  );
};

export default GridVideoView;
