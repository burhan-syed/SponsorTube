import React from "react";
import Image from "next/image";
import type C4TabbedHeader from "youtubei.js/dist/src/parser/classes/C4TabbedHeader";

type ChannelHeaderProps = {
  channel: C4TabbedHeader;
};

const ChannelHeader = ({ channel }: ChannelHeaderProps) => {
  return (
    <>
      {channel?.banner?.[0]?.url && (
        <Image
          src={channel.banner[0]?.url}
          height={channel.banner[0].height}
          width={channel.banner[0].width}
          alt=""
          unoptimized={true}
        />
      )}
      <div className="flex flex-col items-center gap-2 p-2 md:flex-row md:gap-7 md:p-6">
        <div className="h-14 w-14 overflow-hidden rounded-full md:h-32 md:w-32">
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

        <div className="flex flex-col items-center gap-1 md:items-start md:gap-2">
          <h1 className="flex gap-1 text-2xl font-semibold">
            {channel.author.name}
            <div>{channel?.author?.is_verified ? "(V)" : ""}</div>
          </h1>
          <p className="flex flex-wrap space-x-2 text-xs text-th-textSecondary md:text-sm">
            <span className="font-semibold">
              {channel?.channel_handle?.text}
            </span>
            <span>{channel?.subscribers?.text}</span>
            <span>{channel?.videos_count?.text}</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default ChannelHeader;
