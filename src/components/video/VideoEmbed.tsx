import React, { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";
const VideoEmbed = ({
  videoID,
  className,
  width,
  height,
  videoSeek,
}: {
  // iFrameSrc: string;
  videoID?: string;
  width?: number;
  height?: number;
  className?: string;
  videoSeek: [number, number, number];
}) => {
  const playerRef = useRef<YouTubePlayer>();
  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    // access to player in all event handlers via event.target
    // event.target && !videoSeek?.[0] && event.target.pauseVideo();
    playerRef.current = event.target;
  };

  const opts: YouTubeProps["opts"] = {
    height: height,
    width: width,
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
      controls: 1,
      enablejsapi: 1,
      fs: 0,
      modestbranding: 1,
      playsinline: 1,
      // end: videoSeek?.[2] ?? Infinity
    },
  };

  useEffect(() => {
    if (videoSeek?.[0] && playerRef.current) {
      playerRef.current?.seekTo(videoSeek?.[1], true);
    }
  }, [videoSeek, playerRef]);

  return (
    <div
      className={`${className} relative`}
      style={{ aspectRatio: `${width ?? 16} / ${height ?? 9}` }}
    >
      {videoID && (
        <YouTube
          className={"absolute h-full w-full"}
          iframeClassName={"absolute w-full h-full inset-0"}
          videoId={videoID}
          opts={opts}
          onReady={onPlayerReady}
        />
      )}
    </div>
  );
};

export default VideoEmbed;
