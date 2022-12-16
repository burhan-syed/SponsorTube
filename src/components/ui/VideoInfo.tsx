import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineThumbUpAlt } from "react-icons/md";
import clsx from "clsx";
type VideoInfoProps = {
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

const INITIALDESCRIPTIONRUNS = 2; 

const VideoInfo = ({
  title,
  views,
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
  const [expandVideoDescription, setExpandVideoDescription] = useState(false);
  return (
    <div className="text-th-textPrimary">
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
      <div>
        {description && (
          <div
            className={clsx(
              "text-xs bg-th-chipBackground rounded-lg p-3 ",
              descriptionRuns &&
                descriptionRuns?.length > INITIALDESCRIPTIONRUNS &&
                !expandVideoDescription &&
                "hover:cursor-pointer hover:bg-th-chipBackgroundHover"
            )}
            onClick={() => {
              descriptionRuns &&
                descriptionRuns?.length > INITIALDESCRIPTIONRUNS &&
                !expandVideoDescription &&
                setExpandVideoDescription(true);
            }}
            style={{ whiteSpace: "pre-line" }}
          >
            <span className="font-semibold">
              {views && (
                <>
                  {new Intl.NumberFormat("en-US", {
                    notation: "compact",
                  }).format(views)}
                  {`views `}
                </>
              )}
              {uploadDate}
            </span>
            <p>
              {descriptionRuns?.slice(0, INITIALDESCRIPTIONRUNS)?.map((run, i) => (
                <>
                  <span
                    key={i}
                    className={clsx(
                      i === (INITIALDESCRIPTIONRUNS-1) &&
                        !expandVideoDescription &&
                        descriptionRuns?.length > INITIALDESCRIPTIONRUNS &&
                        "relative"
                    )}
                  >
                    {run.text}
                    {i === (INITIALDESCRIPTIONRUNS-1) &&
                      !expandVideoDescription &&
                      descriptionRuns?.length > INITIALDESCRIPTIONRUNS && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white"></div>
                      )}
                  </span>
                </>
              ))}
              {descriptionRuns && descriptionRuns?.length > INITIALDESCRIPTIONRUNS && (
                <>
                  {expandVideoDescription ? (
                    <>
                      {descriptionRuns?.slice(4)?.map((run, i) => (
                        <>
                          <span key={i}>{run.text}</span>
                        </>
                      ))}
                      <br />
                      <button
                        className="mt-4 font-semibold"
                        onClick={() => setExpandVideoDescription(false)}
                      >
                        Show less
                      </button>
                    </>
                  ) : (
                    <button
                      className=" z-10 font-semibold"
                      onClick={() => setExpandVideoDescription(true)}
                    >
                      Show more
                    </button>
                  )}
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoInfo;
