import React, { useEffect, useRef } from "react";
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";
let rendercount = 0;
const YTEmbedMemo = ({
  videoID,
  height,
  width,
  videoSeek,
}: {
  videoID: string;
  height?: number;
  width?: number;
  videoSeek?: [number, number, number];
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
  rendercount++;
  console.log("render?", rendercount);
  useEffect(() => {
    if (videoSeek?.[0] && playerRef.current) {
      playerRef.current?.seekTo(videoSeek?.[1], true);
    }
  }, [videoSeek, playerRef]);
  return (
    <>
      <YouTube
        className={"absolute h-full w-full"}
        iframeClassName={"absolute w-full h-full inset-0"}
        videoId={videoID}
        opts={opts}
        onReady={onPlayerReady}
      />
    </>
  );
};

export default React.memo(YTEmbedMemo);
