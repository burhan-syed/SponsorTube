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
      <a className="flex items-center hover:cursor-pointer text-th-textSecondary text-xs">
        <div className="flex aspect-video w-80 flex-none items-center justify-center overflow-hidden rounded-2xl">
          <div className="h-32 w-32 overflow-hidden rounded-full">
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
            <h3 className="text-th-textPrimary text-base">{channel.author.name}</h3>
            <span>
              {channel.subscribers.text}
              <span>{channel.videos?.text}</span>
            </span>
          </div>

          <p>{channel.description_snippet.text}</p>
        </div>
      </a>
    </Link>
  );
};

export default ChannelCard;
