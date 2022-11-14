import React from "react";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";
import VideoCard from "../components/ui/VideoCard";
import Header from "../components/ui/Header";
import ChannelCard from "../components/ui/ChannelCard";

import type {VideoWithThumbnail} from "../types"

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query;
  const searchQuery = decodeURIComponent((Array.isArray(q) ? q?.[0] : q) ?? "");
  const searchResults = trpc.search.ytSearch.useQuery(
    { searchQuery },
    {
      enabled: !!searchQuery,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );
  console.log("Search:", searchResults.data);
  return (
    <div>
      <Header searchInitialValue={searchQuery} />
      {searchResults.isLoading ? (
        "Loading.."
      ) : searchResults.data ? (
        <div className="flex flex-col gap-2">
          {searchResults.data.channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
          {searchResults.data.videos?.map((video, i) => (
            <VideoCard
              key={video.id}
              video={video as VideoWithThumbnail}
            />
          ))}
        </div>
      ) : (
        "something went wrong"
      )}
    </div>
  );
};

export default SearchPage;
