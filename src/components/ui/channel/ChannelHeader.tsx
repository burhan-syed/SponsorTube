import React from "react";
import Image from "next/image";
import type C4TabbedHeader from "youtubei.js/dist/src/parser/classes/C4TabbedHeader";
import ChannelProcessButton from "./ChannelProcessButton";
import { BsCheck2 } from "react-icons/bs";

type ChannelHeaderProps = {
  channel: C4TabbedHeader;
  channelId: string;
  description?: string;
};

const ChannelHeader = ({
  channel,
  channelId,
  description,
}: ChannelHeaderProps) => {
  return (
    <div className="flex w-full flex-none flex-col items-center gap-2 md:flex-row md:gap-7">
      <div className="h-14 w-14 flex-none overflow-hidden rounded-full md:h-32 md:w-32">
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
      <div className="flex w-full flex-col items-center gap-y-2 md:flex-grow md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-center gap-1 md:items-start md:gap-2">
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            {channel.author.name}
            {channel?.author?.is_verified ? (
              <BsCheck2 className="h-4 w-4 flex-none md:h-6 md:w-6" />
            ) : (
              <></>
            )}
          </h1>
          <ul className="flex flex-wrap space-x-2 text-xs text-th-textSecondary md:text-sm">
            <li className="font-semibold">{channel?.channel_handle?.text}</li>
            <li>{channel?.subscribers?.text}</li>
            <li>{channel?.videos_count?.text}</li>
          </ul>
          {description && (
            <p className="max-w-2xl text-center text-xs text-th-textSecondary md:text-left md:text-sm ">
              {description}
            </p>
          )}
        </div>
        <ChannelProcessButton channelId={channelId} />
      </div>
    </div>
  );
};

export default ChannelHeader;
