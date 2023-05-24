import React from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import VideoCard from "@/components/video/VideoCard";
import Header from "@/components/Header";
import ChannelCard from "@/components/channel/ChannelCard";
import ListVideoLoader from "@/components/ui/loaders/ListVideoLoader";
import Head from "next/head";

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
    <>
      <Head>
        <title>{searchQuery + " | Search SponsorTube"}</title>
        <meta
          name="description"
          content="search for YouTube sponsor information"
        />
      </Head>
      <Header searchInitialValue={searchQuery} />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-2">
        {!!searchQuery ? (
          <>
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
              <p className="my-10 text-center">{"no results found"}</p>
            )}
          </>
        ) : (
          <p className="my-10 text-center">
            {"no results found"}
            <br />
            {"enter a search query"}
          </p>
        )}
      </section>
    </>
  );
};

export default SearchPage;
