import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import useSponsorBlock from "../../hooks/useSponsorBlock";

import type { VideoWithThumbnail } from "../../types";
import useIsPressed from "@/hooks/useIsPressed";
import TouchResponse from "./common/TouchResponse";

type VideoCardProps = {
  video: VideoWithThumbnail;
};

const VideoCard = ({ video }: VideoCardProps) => {
  const { containerRef, isPressed } = useIsPressed();
  const { ref: inViewRef, inView } = useInView();
  const { segments, savedSegments } = useSponsorBlock({
    videoID: inView ? video.id : "",
  });
  const setRefs = useCallback(
    (node: HTMLDivElement) => {
      // Ref's from useRef needs to have the node assigned to `current`
      containerRef.current = node;
      // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
      inViewRef(node);
    },
    [inViewRef]
  );

  const videoThumbnail = video?.video_thumbnail ?? video.thumbnails?.[0];
  return (
    <div className="relative">
      <div
        ref={setRefs}
        // onClick={() => router.push(`/video?v=${video.id}`)}
        className={
          "flex  items-start rounded-lg p-2 text-xs text-th-textSecondary"
        }
      >
        <Link href={`/video?v=${video.id}`} className="bg-gray-600 aspect-video w-80 flex-none overflow-hidden rounded-2xl">
            {videoThumbnail?.url && (
              <Image
                src={videoThumbnail?.url}
                alt=""
                width={videoThumbnail?.width}
                height={videoThumbnail?.height}
                unoptimized={true}
              />
            )}
        </Link>

        <div className="flex-col">
          <div className="">
            <h3 className="text-base text-th-textPrimary">
              <Link href={`/video?v=${video.id}`}>
                {video.title?.text}
              </Link>
            </h3>
            <span>
              {video.short_view_count?.text}
              <span>{video.published?.text}</span>
            </span>
          </div>
          {video.author.id && video.author.id !== "N/A" && (
            <Link href={`/channel/${video.author.id}`} className="flex">
                <div className="h-6 w-6 flex-none overflow-hidden rounded-full">
                  {video.author.thumbnails?.[0]?.url && (
                    <Image
                      src={video.author.thumbnails?.[0]?.url}
                      alt=""
                      width={video.author.thumbnails?.[0]?.width}
                      height={video.author.thumbnails?.[0]?.height}
                      unoptimized={true}
                    />
                  )}
                </div>
                <span>{video.author.name}</span>
            </Link>
          )}

          <p className="text-xs">{video.snippets?.[0]?.text?.text}</p>
          <div className="w-full rounded-full bg-th-additiveBackground bg-opacity-5 text-sm">
            {segments.isLoading
              ? "checking for segments.."
              : segments.data
              ? segments.data.length
              : "something went wrong"}
            {"|"}
            {savedSegments.isLoading
              ? "checking for saved segments.."
              : savedSegments.data
              ? savedSegments.data.length
              : "something went wrong w/saved segments"}
          </div>
        </div>
      </div>
      <TouchResponse className="rounded-lg" isPressed={isPressed} />
    </div>
  );
};

export default VideoCard;
