import useMonitorChannel from "@/hooks/useMonitorChannel";
import { trpc } from "@/utils/trpc";

const ChannelStats = ({ channelId }: { channelId: string }) => {
  const channelStatus = useMonitorChannel({ channelId });
  const channelStats = trpc.channel.getStats.useQuery({ channelId });
  const channelSponsors = trpc.channel.getSponsors.useQuery({ channelId });

  if (channelStats.isLoading || channelStats.isLoading) {
    return <div>Loading stats..</div>;
  }

  return (
    <div>
      {channelStats.isLoading ? (
        "loading.."
      ) : channelStats.data?.[0]?.channelId ? (
        <>
          <p>
            <span>
              {channelStats.data?.[0]?.videosProcessed} videos processed
            </span>
            <span>
              {channelStats.data?.[0]?.numberVideosSponsored} videos with
              sponsors
            </span>
            <span>
              {channelStats.data?.[0]?.totalSponsorSegments} sponsored segments
            </span>
            <span>
              {channelStats.data?.[0]?.totalSponsorTime?.toFixed(0)} seconds of
              sponsored segments
            </span>
          </p>
        </>
      ) : channelStats.error ? (
        "error"
      ) : (
        "no channel stats"
      )}

      {channelSponsors.isLoading ? (
        "sloading.."
      ) : channelSponsors.data ? (
        <ul className="flex flex-row flex-wrap gap-2">
          {[...new Set(channelSponsors?.data?.map?.((c) => c.brand))].map(
            (s, i) => (
              <li key={s}>{s}</li>
            )
          )}
        </ul>
      ) : (
        "?"
      )}
    </div>
  );
};

export default ChannelStats;
