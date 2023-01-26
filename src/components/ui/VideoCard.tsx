import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import useIsPressed from "@/hooks/useIsPressed";
import TouchResponse from "./common/TouchResponse";
import clsx from "clsx";
import useSponsorBlock from "../../hooks/useSponsorBlock";
import type CompactVideo from "youtubei.js/dist/src/parser/classes/CompactVideo";
import type { VideoWithThumbnail } from "../../types";
type VideoCardProps = {
  video: VideoWithThumbnail | CompactVideo;
  variant?: "regular" | "compact";
};

const VideoCard = ({ video, variant = "regular" }: VideoCardProps) => {
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

  const videoThumbnail =
    (video as VideoWithThumbnail)?.video_thumbnail ?? video.thumbnails?.[0];
  const authorThumbnail = video.author.thumbnails?.[0]?.url;
  const ChannelThumbnail = (
    <div
      className={clsx(
        "flex-none overflow-hidden rounded-full",
        variant === "regular"
          ? "h-10 w-10 sm:h-6 sm:w-6"
          : variant === "compact" && "h-6 w-6"
      )}
    >
      {authorThumbnail && (
        <Image
          src={authorThumbnail}
          alt=""
          width={video.author.thumbnails?.[0]?.width}
          height={video.author.thumbnails?.[0]?.height}
          unoptimized={true}
        />
      )}
    </div>
  );

  return (
    <div
      className={clsx(
        "relative",
        variant === "regular" ? "" : variant === "compact" && "w-full"
      )}
    >
      <div
        ref={setRefs}
        // onClick={() => router.push(`/video?v=${video.id}`)}
        className={clsx(
          "flex items-start gap-2 rounded-lg  text-xs text-th-textSecondary ",
          variant === "regular"
            ? "flex-col py-2 sm:flex-row sm:p-2"
            : variant === "compact" && "flex-row p-2 sm:flex-col"
        )}
      >
        <Link href={`/video?v=${video.id}`}>
          <a
            className={clsx(
              "relative aspect-video flex-none overflow-hidden  bg-th-additiveBackground bg-opacity-5",
              variant === "regular"
                ? "w-full sm:w-80 sm:rounded-2xl"
                : variant === "compact" && "w-40 rounded-2xl sm:w-full"
            )}
          >
            {videoThumbnail?.url && (
              <Image
                src={videoThumbnail?.url}
                alt=""
                width={videoThumbnail?.width}
                height={videoThumbnail?.height}
                layout="fill"
                unoptimized={true}
              />
            )}
          </a>
        </Link>
        <div className="flex gap-2">
          {authorThumbnail && (
            <Link href={`/channel/${video.author.id}`}>
              <a
                className={clsx(
                  variant === "regular"
                    ? "block px-2 sm:hidden sm:px-0"
                    : variant === "compact" && "hidden sm:block"
                )}
              >
                {ChannelThumbnail}
              </a>
            </Link>
          )}

          <div className="flex-col">
            <div
              className={clsx(
                "flex flex-col",
                variant === "regular" && "sm:gap-1"
              )}
            >
              <h3
                className={clsx(
                  " text-th-textPrimary",
                  variant === "regular"
                    ? "text-base sm:text-lg "
                    : variant === "compact" &&
                        "text-base font-normal leading-7 sm:font-semibold sm:leading-tight"
                )}
              >
                <Link href={`/video?v=${video.id}`}>
                  <a>{video.title?.text}</a>
                </Link>
              </h3>
              <span className="flex flex-wrap gap-1">
                <span
                  className={clsx(
                    variant === "regular"
                      ? "after:content-['_·_'] sm:hidden"
                      : variant === "compact" && "hidden"
                  )}
                >
                  {video.author.name}
                </span>

                {video.short_view_count?.text}
                <span className={`before:content-['_·_']`}>
                  {video.published?.text}
                </span>
              </span>
            </div>
            {video.author.id && video.author.id !== "N/A" && (
              <Link href={`/channel/${video.author.id}`}>
                <a
                  className={clsx(
                    "items-center gap-2",
                    variant === "regular"
                      ? "hidden sm:flex sm:py-2"
                      : variant === "compact" && "hidden"
                  )}
                >
                  <div>{ChannelThumbnail}</div>
                  <span>{video.author.name}</span>
                </a>
              </Link>
            )}
            {(video as VideoWithThumbnail)?.snippets?.[0]?.text?.text && (
              <p className="hidden text-xs sm:block">
                {(video as VideoWithThumbnail)?.snippets?.[0]?.text?.text}
              </p>
            )}

            <div
            // className={clsx(
            //   variant === "regular"
            //     ? ""
            //     : variant === "compact" && "hidden sm:block"
            // )}
            >
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
        </div>
      </div>
      {/* {variant === "compact" && (
        <div className="px-2 sm:hidden">
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
      )} */}

      <TouchResponse className="rounded-xl" isPressed={isPressed} />
    </div>
  );
};

export default VideoCard;
