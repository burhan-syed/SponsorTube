import { api } from "@/utils/api";
import ChannelSponsorsPills from "./ChannelSponsorsPills";
import ChannelSponsorsLoader from "@/components/ui/loaders/channel/ChannelSponsorsLoader";

const ChannelSponsors = ({ channelId }: { channelId: string }) => {
  const channelSponsors = api.channel.getSponsors.useQuery({ channelId });

  return (
    <div>
      {channelSponsors.isLoading ? (
        <ChannelSponsorsLoader />
      ) : channelSponsors.data ? (
        <>
          {channelSponsors?.data?.length > 0 ? (
            <ChannelSponsorsPills
              sponsors={[
                ...new Set(channelSponsors?.data?.map?.((c) => c.brand)),
              ]}
            />
          ) : (
            <ChannelSponsorsLoader noneFound={true} />
          )}
        </>
      ) : (
        "error loading channel sponsors"
      )}
    </div>
  );
};

export default ChannelSponsors;
