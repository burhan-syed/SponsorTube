import { trpc } from "@/utils/trpc";
import React, { useMemo } from "react";

const ChannelStats = ({ channelId }: { channelId: string }) => {
  const channelStats = trpc.channel.getStats.useQuery({ channelId });

  const numVideosProcessed = useMemo(
    () =>
      Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(channelStats.data?.[0]?.videosProcessed ?? 0),
    [channelStats.data]
  );

  const numVideosSponsored = useMemo(
    () =>
      Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(channelStats.data?.[0]?.numberVideosSponsored ?? 0),
    [channelStats.data]
  );

  const totalSponsorSegments = useMemo(
    () =>
      Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(channelStats.data?.[0]?.totalSponsorSegments ?? 0),
    [channelStats.data]
  );

  const totalSponsorTime = useMemo(
    () =>
      Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(channelStats.data?.[0]?.totalSponsorTime ?? 0),
    [channelStats.data]
  );

  return (
    <div>
      {channelStats.isLoading ? (
        "loading.."
      ) : channelStats.data?.[0]?.channelId ? (
        <>
          <ul className="flex flex-wrap items-center justify-center space-x-2 font-semibold md:text-base ">
            <li>{numVideosProcessed} videos analyzed</li>
            <li>{numVideosSponsored} videos with sponsors</li>
            <li>{totalSponsorSegments} sponsored segments</li>
            <li>
              {channelStats.data?.[0]?.processedFrom?.toDateString()} to{" "}
              {channelStats.data?.[0]?.processedTo?.toDateString()}{" "}
            </li>
          </ul>
        </>
      ) : channelStats.error ? (
        "error"
      ) : (
        "no channel stats"
      )}
    </div>
  );
};

export default ChannelStats;
