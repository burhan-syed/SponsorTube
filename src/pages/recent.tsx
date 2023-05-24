import Header from "@/components/Header";
import ScrollTextHeader from "@/components/ui/animation/ScrollTextHeader";
import { Button } from "@/components/ui/common/Button";
import GridVideoLoader from "@/components/ui/loaders/GridVideoLoader";
import GridVideoView from "@/components/video/GridVideoView";
import { VideoCardInfo } from "@/types/schemas";
import { api } from "@/utils/api";
import React from "react";

const limit = 30;
const RecentsPage = () => {
  const recentVods = api.video.getRecent.useInfiniteQuery(
    { limit: limit, withSponsors: true },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  const flatVideos = recentVods.data?.pages
    .map((p) =>
      p.vods.map((v) => ({
        id: v.id,
        title: v.title,
        publishedDate: v.published,
        thumbnail: v.thumbnail
          ? {
              url: v.thumbnail,
              height: v?.thumbnailHeight ?? undefined,
              width: v?.thumbnailWidth ?? undefined,
            }
          : undefined,
        author: {
          id: v.channelId,
          name: v.Channel.name ?? "",
          thumbnail: v.Channel.thumbnail
            ? { url: v.Channel.thumbnail }
            : undefined,
        },
      }))
    )
    .flat() as VideoCardInfo[];
  return (
    <div className="min-h-screen">
      <Header />
      <div className="relative my-2 lg:my-4">
        <ScrollTextHeader
          text="Recent Videos"
          completeAt={0.2}
          loading={recentVods.isLoading}
          disable={false}
          className="md:px-[calc(10vw)] 2xl:max-w-[192rem]"
          headerClassName="px-2 sm:px-0"
          innerClassName=""
          innerContainerSizePercent={1.1}
        />
        <section className="mx-auto md:px-[10vw] 2xl:max-w-[192rem]">
          {recentVods.isLoading ? (
            <GridVideoLoader count={limit} />
          ) : flatVideos?.length ?? 0 > 0 ? (
            <>
              <GridVideoView
                videos={flatVideos}
                showLoading={recentVods.isFetchingNextPage ? limit : 0}
              />
            </>
          ) : (
            "something went wrong"
          )}
          <div className="my-2 flex w-full items-center justify-center lg:my-4">
            <Button
              disabled={
                recentVods.isLoading ||
                recentVods.isFetching ||
                !recentVods.hasNextPage
              }
              loading={recentVods.isLoading || recentVods.isFetching}
              onClick={() => recentVods.fetchNextPage()}
            >
              load more
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RecentsPage;
