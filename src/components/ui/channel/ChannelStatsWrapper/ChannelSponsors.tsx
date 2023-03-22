import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/common/Button";
import ChannelSponsorsPills from "./ChannelSponsorsPills";

const ChannelSponsors = ({ channelId }: { channelId: string }) => {
  const updateChannelSponsors =
    trpc.channel.updateChannelSponsors.useMutation();
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

      <Button
        loading={channelSponsors.isLoading || updateChannelSponsors.isLoading}
        disabled={channelSponsors.isLoading || updateChannelSponsors.isLoading}
        onClick={() => updateChannelSponsors.mutate({ channelId })}
      >
        sponsors
      </Button>
    </div>
  );
};

export default ChannelSponsors;
