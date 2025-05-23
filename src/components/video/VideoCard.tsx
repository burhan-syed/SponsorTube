import React from "react";
import Image from "next/legacy/image";
import Link from "next/link";
import useIsPressed from "@/hooks/useIsPressed";
import TouchResponse from "@/components/ui/common/TouchResponse";
import SegmentsPreview from "@/components/ui/SegmentsPreview";
import { VideoCardInfo } from "@/types/schemas";
import { useRouter } from "next/router";
import { cn } from "@/utils/cn";
type VideoCardProps = {
  video: VideoCardInfo;
  variant?: "regular" | "compact";
  flip?: boolean;
};

const VideoCard = ({
  video,
  variant = "regular",
  flip = false,
}: VideoCardProps) => {
  const { containerRef, isPressed } = useIsPressed();
  const router = useRouter();
  const videoThumbnail = video.thumbnail;
  const authorThumbnail = video.author?.thumbnail?.url;
  const ChannelThumbnail = (
    <div
      className={cn(
        "relative flex-none overflow-hidden rounded-full",
        variant === "regular"
          ? "h-10 w-10 sm:h-6 sm:w-6"
          : variant === "compact" && "h-6 w-6"
      )}
    >
      {authorThumbnail && (
        <Image
          src={authorThumbnail}
          alt=""
          width={video.author?.thumbnail?.width}
          height={video.author?.thumbnail?.height}
          layout={"fill"}
          unoptimized={true}
          // style={{
          //   maxWidth: "100%",
          //   height: "auto"
          // }}
        />
      )}
    </div>
  );

  const SponsorInfo = (
    <Link href={`/video?v=${video.id}`} className="">
      <SegmentsPreview
        videoId={video.id}
        className={cn(
          variant === "compact" ? "" : variant === "regular" && " sm:my-2 ",
          "text-semibold inline-flex h-6 cursor-pointer flex-wrap items-center gap-x-1 gap-y-1 overflow-y-auto overflow-x-hidden text-xs sm:gap-x-2"
        )}
      />
    </Link>
  );

  return (
    <div
      className={cn(
        "relative",
        variant === "regular" ? "" : variant === "compact" && "w-full"
      )}
    >
      <div
        ref={containerRef}
        onClick={(e) => {
          router.push(`/video?v=${video.id}`);
        }}
        className={cn(
          "flex items-start gap-2 rounded-lg  text-xs text-th-textSecondary ",
          variant === "regular"
            ? "flex-col sm:flex-row sm:p-2"
            : variant === "compact" && "flex-row p-2 sm:flex-col"
        )}
      >
        <Link
          href={`/video?v=${video.id}`}
          className={cn(
            "relative aspect-video flex-none overflow-hidden  bg-th-additiveBackground bg-opacity-5",
            variant === "regular"
              ? "w-full sm:w-80 sm:rounded-2xl"
              : variant === "compact" && "w-40 rounded-2xl sm:w-full",
            flip && "order-2"
          )}
        >
          {videoThumbnail?.url && (
            <Image
              src={videoThumbnail?.url}
              alt=""
              width={videoThumbnail?.width}
              height={videoThumbnail?.height}
              unoptimized={true}
              layout="fill"
              // sizes="100vw"
              // style={{
              //   width: "100%",
              //   height: "auto"
              // }}
            />
          )}
        </Link>

        <div className={cn("flex w-full gap-2 pr-2", flip && "order-1 justify-end")}>
          {authorThumbnail && video.author?.id && (
            <Link
              href={`/channel/${video.author.id}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={cn(
                variant === "regular"
                  ? "block px-2 sm:hidden sm:px-0"
                  : variant === "compact" && "hidden sm:block"
              )}
            >
              {ChannelThumbnail}
            </Link>
          )}

          <div className="w-full flex-col">
            <div
              className={cn(
                "flex flex-col",
                variant === "regular" && "order-2 sm:gap-1"
              )}
            >
              <h3
                className={cn(
                  " break-words text-th-textPrimary ",
                  variant === "regular"
                    ? "text-base sm:text-lg "
                    : variant === "compact" &&
                        "text-base font-normal leading-7 sm:font-semibold sm:leading-tight"
                )}
              >
                <Link href={`/video?v=${video.id}`}>{video.title}</Link>
              </h3>
              {/* {variant === "compact" && (
                <div className="sm:-mx-1 sm:w-full">{SponsorInfo}</div>
              )} */}

              <span className="flex flex-wrap gap-1">
                <span
                  className={cn(
                    variant === "regular"
                      ? "after:content-['_·_'] sm:hidden"
                      : variant === "compact" && "hidden"
                  )}
                >
                  {video?.author?.name}
                </span>

                {video.viewCountString}
                <span
                  className={
                    video.viewCountString &&
                    (video.publishedDate || video.publishedString)
                      ? `before:content-['_·_']`
                      : ""
                  }
                >
                  {video.publishedString
                    ? video.publishedString
                    : video.publishedDate
                    ? video.publishedDate?.toLocaleDateString(undefined, {
                        dateStyle: "long",
                      })
                    : ""}
                </span>
              </span>

              {variant === "compact" &&
                video?.author?.id &&
                video.author.id !== "N/A" && (
                  <Link
                    href={`/channel/${video.author.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className=""
                  >
                    {video.author.name}
                  </Link>
                )}
            </div>
            {video?.author?.id && video.author.id !== "N/A" && (
              <Link
                href={`/channel/${video.author.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={cn(
                  "items-center gap-2",
                  variant === "regular"
                    ? "order-3 hidden sm:flex sm:py-2"
                    : variant === "compact" && "hidden"
                )}
              >
                <div>{ChannelThumbnail}</div>
                <span>{video.author.name}</span>
              </Link>
            )}

            {video.shortDescription && (
              <p className="hidden text-xs sm:block">
                {video.shortDescription}
              </p>
            )}
            {<>{SponsorInfo}</>}
          </div>
        </div>
      </div>

      <TouchResponse
        className={cn(
          variant === "compact" && "rounded-xl",
          variant === "regular" && "sm:rounded-xl"
        )}
        isPressed={isPressed}
      />
    </div>
  );
};

export default VideoCard;
