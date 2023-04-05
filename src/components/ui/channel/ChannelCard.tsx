import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { ChannelCardInfo } from "@/types/schemas";
import useIsPressed from "@/hooks/useIsPressed";
import TouchResponse from "../common/TouchResponse";

type ChannelCardProps = {
  channel: ChannelCardInfo;
};

const ChannelCard = ({ channel }: ChannelCardProps) => {
  const { isPressed, containerRef } = useIsPressed();
  const thumbnail = channel.thumbnail;
  return (
    <Link href={`/channel/${channel.id}`}>
      <a
        ref={containerRef}
        className="relative flex items-center rounded-lg text-xs text-th-textSecondary hover:cursor-pointer"
      >
        <div className="flex aspect-video w-1/2 flex-none items-center justify-center overflow-hidden rounded-2xl sm:w-80">
          <div className="h-24 w-24 overflow-hidden rounded-full sm:h-32 sm:w-32">
            {thumbnail?.url && (
              <Image
                src={`https:${thumbnail?.url}`}
                alt=""
                width={thumbnail?.width}
                height={thumbnail?.height}
                unoptimized={true}
              />
            )}
          </div>
        </div>

        <div className="flex-col">
          <div className="">
            <h3 className="text-base text-th-textPrimary ">{channel.name}</h3>
            <span>
              {channel.subscriberCountText}
              <span className="before:content-['_·_']">
                {channel.videoCountText}
              </span>
            </span>
          </div>

          <p>{channel.shortDescription}</p>
        </div>

        <TouchResponse isPressed={isPressed} className="rounded-xl" />
      </a>
    </Link>
  );
};

export default ChannelCard;
