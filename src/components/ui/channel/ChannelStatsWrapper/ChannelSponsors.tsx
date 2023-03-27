import { trpc } from "@/utils/trpc";
import ChannelSponsorsPills from "./ChannelSponsorsPills";

const ChannelSponsors = ({ channelId }: { channelId: string }) => {
  const channelSponsors = trpc.channel.getSponsors.useQuery({ channelId });

  return (
    <div>
      {channelSponsors.isLoading ? (
        "sloading.."
      ) : channelSponsors.data ? (
        <>
          {channelSponsors?.data?.length > 0 ? (
            <ChannelSponsorsPills
              sponsors={[
                ...new Set(channelSponsors?.data?.map?.((c) => c.brand)),
              ]}
            />
          ) : (
            <>no sponsors</>
          )}
        </>
      ) : (
        "?"
      )}
    </div>
  );
};

export default ChannelSponsors;
