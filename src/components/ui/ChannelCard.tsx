import React from "react";
import Image from "next/image";

import Channel from "youtubei.js/dist/src/parser/classes/Channel";
import Link from "next/link";

type ChannelCardProps = {
  channel: Channel;
};

const ChannelCard = ({ channel }: ChannelCardProps) => {
  const thumbnail = channel.author.thumbnails?.[0];
  return (
    <Link href={`/channel/${channel.id}`}>
      <a className="flex items-center text-xs text-th-textSecondary hover:cursor-pointer">
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
            <h3 className="text-base text-th-textPrimary ">
              {channel.author.name}
            </h3>
            <span>
              {channel.subscribers.text}
              <span className="before:content-['_·_']">
                {channel.videos?.text}
              </span>
            </span>
          </div>

          <p>{channel.description_snippet.text}</p>
        </div>
      </a>
    </Link>
  );
};

export default ChannelCard;
