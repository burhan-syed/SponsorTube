import React from "react";
import { useRouter } from "next/router";
import { api } from "../utils/api";
import VideoCard from "../components/ui/VideoCard";
import Header from "../components/Header";
import ChannelCard from "../components/ui/channel/ChannelCard";
import ListVideoLoader from "@/components/ui/loaders/ListVideoLoader";

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query;
  const searchQuery = decodeURIComponent((Array.isArray(q) ? q?.[0] : q) ?? "");
  const searchResults = api.search.ytSearch.useQuery(
    { searchQuery },
    {
      enabled: !!searchQuery,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );
  return (
    <div>
      <Header searchInitialValue={searchQuery} />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
        {searchResults.isLoading ? (
          <ListVideoLoader />
        ) : searchResults?.data ? (
          <>
            {searchResults?.data?.channels?.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
            {searchResults.data.videos?.map((video, i) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </>
        ) : (
          "something went wrong"
        )}
      </div>
    </div>
  );
};

export default SearchPage;
