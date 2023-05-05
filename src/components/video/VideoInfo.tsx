import React from "react";
import Image from "next/image";
import Link from "next/link";
import VideoDescription from "./VideoDescription";
import VideoSponsors from "./VideoSponsors";
import { VideoDetailsInfo } from "@/types/schemas";
import clsx from "clsx";
import VerifiedBadge from "../ui/VerifiedBadge";

import { FiThumbsUp } from "react-icons/fi";
import { IoMdEye } from "react-icons/io";
import ToolTip from "../ui/common/Tooltip";
import AutoAnnotateAll from "@/components/transcripts/AutoAnnotateAll";

type VideoInfoProps = {
  videoId: string;
  info: VideoDetailsInfo;
};

const VideoInfo = ({ videoId, info }: VideoInfoProps) => {
  const { title, viewCount, likeCount, description, publishedString } = info;
  const {
    thumbnail: authorThumbnail,
    id: authorId,
    name: authorName,
    isVerified,
    isVerifiedArtist,
    subscriberCountText,
  } = info.author;
  return (
    <div className="flex flex-col gap-2 text-th-textPrimary">
      <a
        href={`https://youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel={"noreferrer"}
      >
        <h1 className="text-xl font-semibold">{title}</h1>
      </a>
      <div className="flex flex-wrap items-end justify-between">
        <div className="flex flex-none items-center gap-x-2">
          <ToolTip
            text={authorName}
            tooltipOptions={{
              side: "top",
              sideOffset: 15,
            }}
          >
            <Link href={`/channel/${authorId}`}>

              <div
                className={clsx(
                  !authorThumbnail?.url && "bg-th-chipBackgroundHover",
                  "relative h-10 w-10 flex-none overflow-hidden rounded-full "
                )}
              >
                {authorThumbnail?.url ? (
                  <Image
                    src={authorThumbnail.url}
                    unoptimized={true}
                    alt={""}
                    width={40}
                    height={40}
                    style={{
                      maxWidth: "100%",
                      height: "auto"
                    }}></Image>
                ) : (
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 uppercase">
                    {authorName.substring(0, 2)}
                  </span>
                )}
              </div>

            </Link>
          </ToolTip>

          <div className="">
            <div className="flex items-center gap-x-1">
              <Link href={`/channel/${authorId}`} className="text-lg font-normal">
                {authorName}
              </Link>
              {isVerifiedArtist ? (
                <>
                  <VerifiedBadge
                    className="mb-0.5 h-3 w-3 p-0 "
                    artist={true}
                  />
                </>
              ) : (
                isVerified && (
                  <>
                    <VerifiedBadge className="mb-0.5 h-3 w-3 p-0 " />
                  </>
                )
              )}
            </div>
            <span className="text-xs font-light text-th-textSecondary">
              {subscriberCountText}
            </span>
          </div>
        </div>
        <p className="ml-auto flex flex-wrap items-center justify-end gap-x-2 px-0.5 pb-0.5 text-xs font-light">
          <ToolTip
            text={`${
              publishedString?.toLowerCase()?.includes("streamed")
                ? ""
                : "uploaded "
            }${publishedString}`}
            tooltipOptions={{
              side: "top",
              sideOffset: 15,
            }}
          >
            <span>{publishedString}</span>
          </ToolTip>

          {likeCount && (
            <ToolTip
              text={`${new Intl.NumberFormat("en-US").format(likeCount)} likes`}
              tooltipOptions={{
                side: "top",
                sideOffset: 15,
              }}
            >
              <span className="flex items-center gap-x-1">
                {new Intl.NumberFormat("en-US", {
                  notation: "compact",
                }).format(likeCount)}
                <FiThumbsUp className="mb-0.5" />
              </span>
            </ToolTip>
          )}
          {viewCount && (
            <ToolTip
              text={`${new Intl.NumberFormat("en-US").format(viewCount)} views`}
              tooltipOptions={{
                side: "top",
                sideOffset: 15,
              }}
            >
              <span className="flex items-center gap-x-1">
                {new Intl.NumberFormat("en-US", {
                  notation: "compact",
                }).format(viewCount)}
                <IoMdEye />
              </span>
            </ToolTip>
          )}
        </p>
      </div>
      <div className="">
        <AutoAnnotateAll videoId={videoId} isLoading={false} />
      </div>
      <div className="order-1 md:order-2">
        {description && (
          <VideoDescription
            views={viewCount}
            descriptionRuns={description.runs}
            uploadDate={publishedString}
          />
        )}
      </div>
      <div className="order-2 md:order-1">
        <VideoSponsors videoId={videoId} />
      </div>
    </div>
  );
};

export default VideoInfo;
