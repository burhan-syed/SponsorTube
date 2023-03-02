import React from "react";
import Image from "next/image";
import type C4TabbedHeader from "youtubei.js/dist/src/parser/classes/C4TabbedHeader";

type ChannelHeaderProps = {
  channel: C4TabbedHeader;
};

const ChannelHeader = ({ channel }: ChannelHeaderProps) => {
  return (
    <div>
      {channel?.banner?.[0]?.url && (
        <Image
          src={channel.banner[0]?.url}
          height={channel.banner[0].height}
          width={channel.banner[0].width}
          alt=""
          unoptimized={true}
        />
      )}
      <div className="flex items-center ">
        <div className="h-20 w-20 overflow-hidden rounded-full">
          {channel.author.thumbnails?.[0]?.url && (
            <Image
              src={channel.author.thumbnails?.[0]?.url}
              height={channel.author.thumbnails?.[0].height}
              width={channel.author.thumbnails?.[0].width}
              alt=""
              unoptimized={true}
            />
          )}
        </div>

        <div className="flex flex-col">
          <h1>{channel.author.name}</h1>
          <span>{channel?.subscribers?.text}</span>
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;
