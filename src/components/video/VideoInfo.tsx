import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineThumbUpAlt } from "react-icons/md";
import VideoDescription from "./VideoDescription";
import VideoSponsors from "./VideoSponsors";

type VideoInfoProps = {
  videoId: string;
  title?: string;
  views?: number;
  viewsString?: string;
  likes?: number;
  uploadDate?: string;
  description?: string;
  descriptionRuns?: {
    text: string;
  }[];
  channelName?: string;
  channelSubscribers?: string;
  channelURL?: string;
  channelID?: string;
  channelThumbnail?: string;
  channelIsVerified?: boolean;
  channelIsVerifiedArtist?: boolean;
};

const VideoInfo = ({
  title,
  views,
  videoId,
  viewsString,
  likes,
  uploadDate,
  description,
  descriptionRuns,
  channelName,
  channelSubscribers,
  channelURL,
  channelID,
  channelThumbnail,
  channelIsVerified,
  channelIsVerifiedArtist,
}: VideoInfoProps) => {
  return (
    <div className="flex flex-col gap-2 text-th-textPrimary">
      <h1>{title}</h1>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {channelThumbnail ? (
            <Link href={`/channel/${channelID}`}>
              <a>
                <Image
                  src={channelThumbnail}
                  unoptimized={true}
                  alt={""}
                  width={40}
                  height={40}
                ></Image>
              </a>
            </Link>
          ) : (
            <div></div>
          )}
          <div className="">
            <div className="flex text-th-textSecondary">
              <Link href={`/channel/${channelID}`}>
                <a>{channelName}</a>
              </Link>
              {channelIsVerifiedArtist ? (
                <div>{"(artist)"}</div>
              ) : (
                channelIsVerified && <div>{"(verified)"}</div>
              )}
            </div>
            <span>{channelSubscribers}</span>
          </div>
        </div>
        <div>
          {likes && (
            <div className="flex items-center">
              <span>
                {new Intl.NumberFormat("en-US", {
                  notation: "compact",
                }).format(likes)}
              </span>
              <MdOutlineThumbUpAlt className="h-6 w-6 flex-none" />
            </div>
          )}
        </div>
      </div>
      <div className="order-1">
        {description && (
          <VideoDescription
            views={views}
            descriptionRuns={descriptionRuns}
            uploadDate={uploadDate}
          />
        )}
      </div>
      <div className="order-2">
        <VideoSponsors videoId={videoId} />
      </div>
    </div>
  );
};

export default VideoInfo;
