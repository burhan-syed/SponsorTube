import { api } from "@/utils/api";
import ChannelSponsorsPills from "./ChannelSponsorsPills";
import ChannelSponsorsLoader from "@/components/ui/loaders/channel/ChannelSponsorsLoader";
import { Button } from "@/components/ui/common/Button";

const ChannelSponsors = ({ channelId }: { channelId: string }) => {
  const channelSponsors = api.channel.getSponsors.useInfiniteQuery(
    { channelId },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <div>
      {channelSponsors.isLoading ? (
        <ChannelSponsorsLoader />
      ) : channelSponsors.data ? (
        <>
          {(channelSponsors?.data?.pages?.[0]?.sponsors?.length ?? 0) > 0 ? (
            <>
              <ChannelSponsorsPills
                sponsors={[
                  ...new Set(
                    channelSponsors?.data?.pages
                      ?.map((p) => p.sponsors.map((s) => s.brand))
                      .flat()
                  ),
                ]}
              />
              {channelSponsors.hasNextPage && (
                <div className="flex w-full items-center justify-center py-2">
                  <Button
                    className="w-full"
                    variant={"transparent"}
                    size={"small"}
                    loading={channelSponsors.isFetching}
                    disabled={channelSponsors.isFetching}
                    onClick={() => channelSponsors.fetchNextPage()}
                  >
                    load more sponsors
                  </Button>
                </div>
              )}
            </>
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
