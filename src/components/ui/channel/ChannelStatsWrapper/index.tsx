import ChannelSponsors from "./ChannelSponsors";
import ChannelStats from "./ChannelStats";

const ChannelStatsWrapper = ({ channelId }: { channelId: string }) => {
  return (
    <div className="text-xs ">
      <ChannelStats channelId={channelId} />
      <ChannelSponsors channelId={channelId} />
    </div>
  );
};

export default ChannelStatsWrapper;
