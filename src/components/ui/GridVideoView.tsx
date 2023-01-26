import React from "react";
import VideoCard from "./VideoCard";
import type Video from "youtubei.js/dist/src/parser/classes/Video";
import type CompactVideo from "youtubei.js/dist/src/parser/classes/CompactVideo";

const GridVideoView = ({ videos }: { videos: CompactVideo[] | Video[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} variant="compact" />
      ))}
    </div>
  );
};

export default GridVideoView;
