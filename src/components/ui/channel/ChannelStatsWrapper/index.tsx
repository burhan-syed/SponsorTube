import ChannelSponsors from "./ChannelSponsors";
import ChannelStats from "./ChannelStats";

const ChannelStatsWrapper = ({ channelId }: { channelId: string }) => {
  return (
    <div className="text-xs p-2 ">
      <ChannelSponsors channelId={channelId} />
    </div>
  );
};

export default ChannelStatsWrapper;
