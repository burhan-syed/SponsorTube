import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";
import useSponsorBlock from "../../hooks/useSponsorBlock";

import type { VideoWithThumbnail } from "../../types";

type VideoCardProps = {
  video: VideoWithThumbnail;
};

const VideoCard = ({ video }: VideoCardProps) => {
  const router = useRouter();
  const { ref, inView } = useInView();
  const sponsors = useSponsorBlock({ videoID: inView ? video.id : "" });
  const videoThumbnail = video?.video_thumbnail ?? video.thumbnails?.[0];
  return (
    <div
      ref={ref}
      onClick={() => router.push(`/video?v=${video.id}`)}
      className="flex items-start hover:cursor-pointer"
    >
      <Link href={`/video?v=${video.id}`}>
        <a className="aspect-video w-80 flex-none overflow-hidden rounded-2xl bg-gray-600">
          {videoThumbnail?.url && (
            <Image
              src={videoThumbnail?.url}
              alt=""
              width={videoThumbnail?.width}
              height={videoThumbnail?.height}
              unoptimized={true}
            />
          )}
        </a>
      </Link>

      <div className="flex-col">
        <div className="">
          <h3>
            <Link href={`/video?v=${video.id}`}>
              <a>{video.title?.text}</a>
            </Link>
          </h3>
          <span>
            {video.short_view_count?.text}
            <span>{video.published?.text}</span>
          </span>
        </div>
        {video.author.id && video.author.id !== "N/A" && (
          <Link href={`/channel/${video.author.id}`}>
            <a className="flex">
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
            </a>
          </Link>
        )}

        <p>{video.snippets?.[0]?.text?.text}</p>
        <div className="w-full rounded-full bg-yellow-100">
          {sponsors.isLoading
            ? "checking for sponsors.."
            : sponsors.data
            ? sponsors.data.length
            : "something went wrong"}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
