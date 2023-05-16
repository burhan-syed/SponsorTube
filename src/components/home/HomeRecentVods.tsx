import { VideoCardInfo } from "@/types/schemas";
import { api } from "@/utils/api";
import React from "react";
import VideoCard from "../video/VideoCard";
import VideoCardLoader from "../ui/loaders/VideoCardLoader";
import useIsMobileWindow from "@/hooks/useIsMobileWindow";

const HomeRecentVods = ({limit}:{limit:number}) => {
  const isMobile = useIsMobileWindow();
  const recentVods = api.video.getRecent.useInfiniteQuery(
    { limit: limit, withSponsors: true },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  const videos = recentVods.data?.pages
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
    <>
      {recentVods.isLoading ? (
        <>
          {[...new Array(limit)].map((a, i) => (
            <VideoCardLoader
              key={i}
              variant={isMobile ? "compact" : "regular"}
            />
          ))}
        </>
      ) : videos?.length ?? 0 > 0 ? (
        <>
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              variant={isMobile ? "compact" : "regular"}
            />
          ))}
        </>
      ) : (
        "something went wrong"
      )}
    </>
  );
};

export default HomeRecentVods;
