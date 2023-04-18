import Header from "@/components/Header";
import SegmentsPreview from "@/components/ui/SegmentsPreview";
import { Button } from "@/components/ui/common/Button";
import GridVideoLoader from "@/components/ui/loaders/GridVideoLoader";
import GridVideoView from "@/components/video/GridVideoView";
import { VideoCardInfo } from "@/types/schemas";
import { api } from "@/utils/api";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
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
    <div>
      <Header />
      <section className="mx-auto my-2 px-4 md:px-[calc(10vw)] lg:my-4 2xl:max-w-[192rem]">
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
  );
};

export default RecentsPage;
