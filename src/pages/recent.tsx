import Header from "@/components/Header";
import SegmentsPreview from "@/components/ui/SegmentsPreview";
import { Button } from "@/components/ui/common/Button";
import { api } from "@/utils/api";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const RecentsPage = () => {
  const recentVods = api.video.getRecent.useInfiniteQuery(
    { limit: 20, withSponsors: true },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  return (
    <div>
      <Header/>
      {recentVods.isLoading ? (
        "loading"
      ) : recentVods.data?.pages ? (
        <>
          {recentVods.data.pages.map((p) => (
            <div key={p.nextCursor}>
              {p.vods.map((video) => (
                <div key={video.id} className="flex gap-2 p-2">
                  <Link href={`/video?v=${video.id}`}>
                    <a
                      className={
                        "relative aspect-video h-20 flex-none overflow-hidden rounded-2xl bg-th-additiveBackground bg-opacity-5 "
                      }
                    >
                      {video?.thumbnail ? (
                        <Image
                          src={video?.thumbnail}
                          alt=""
                          width={video?.thumbnailWidth ?? undefined}
                          height={video?.thumbnailHeight ?? undefined}
                          layout="responsive"
                          unoptimized={true}
                        />
                      ) : (
                        <>no thumb</>
                      )}
                    </a>
                  </Link>
                  <div className="flex flex-col gap-1">
                    <h2 className="font-semibold">{video.title}</h2>
                    <Link href={`/channel/${video.Channel.id}`}>
                      <a className="underline">{video.Channel.name}</a>
                    </Link>
                    <p>{video.id} : {video.published.toLocaleDateString()}</p>
                    <div>
                      <SegmentsPreview
                        videoId={video.id}
                        className="flex flex-wrap"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      ) : (
        "something went wrong"
      )}
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
  );
};

export default RecentsPage;
