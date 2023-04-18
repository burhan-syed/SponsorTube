import React from "react";
import Image from "next/image";
import Link from "next/link";
import useIsPressed from "@/hooks/useIsPressed";
import TouchResponse from "@/components/ui/common/TouchResponse";
import type { ChannelCardInfo } from "@/types/schemas";

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
        className="relative flex items-center p-2 text-xs text-th-textSecondary hover:cursor-pointer sm:rounded-xl"
      >
        <div className="flex aspect-video w-1/2 flex-none items-center justify-center sm:w-80 ">
          <div className="relative h-24 w-24 overflow-hidden rounded-full sm:h-32 sm:w-32 ">
            {thumbnail?.url && (
              <Image
                src={`https:${thumbnail?.url}`}
                alt=""
                width={thumbnail?.width}
                height={thumbnail?.height}
                layout="responsive"
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

        <TouchResponse isPressed={isPressed} className="sm:rounded-xl" />
      </a>
    </Link>
  );
};

export default ChannelCard;
