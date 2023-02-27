import Head from "next/head";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";
import Header from "../components/Header";
import VideoInfo from "../components/ui/VideoInfo";
import VideoEmbed from "../components/ui/VideoEmbed";
import SponsorTranscripts from "../components/transcripts/SponsorTranscripts";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import VideoPageLoader from "@/components/ui/loaders/VideoPageLoader";
import GridVideoView from "@/components/ui/GridVideoView";
import GridVideoLoader from "@/components/ui/loaders/GridVideoLoader";

const Home: NextPage = ({}) => {
  const router = useRouter();
  const { v } = router.query;
  const videoID = (Array.isArray(v) ? v?.[0] : v) ?? "";
  const videoInfo = trpc.video.info.useQuery(
    { videoID },
    {
      enabled: !!videoID,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

  const testMutate = trpc.video.testMutate.useMutation();

  const [videoSeek, setVideoSeek] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const seekTo = (start: number, end: number) => {
    setVideoSeek((p) => [(p?.[0] ?? 0) + 1, start, end]);
  };

  const [horizontal, setHorizonal] = useState<boolean>();
  useEffect(() => {
    setHorizonal(window.innerWidth >= 1024);
    const onWindowResize = () => {
      setHorizonal(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Video</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="relative sm:p-4">
        {videoInfo.data?.basic_info.id && (
          <button
            onClick={() =>
              testMutate.mutate({
                videoID: videoInfo.data.basic_info.id as string,
              })
            }
          >
            testMutate
          </button>
        )}
        <div className="flex flex-col gap-2 lg:flex-row">
          {videoInfo.isLoading ? (
            <>
              <VideoPageLoader />
            </>
          ) : videoInfo.data ? (
            <>
              {horizontal === undefined && (
                <div className="skeleton-box aspect-video w-full"></div>
              )}
              {horizontal === false && (
                <VideoEmbed
                  className="sticky top-12 z-20 w-full overflow-hidden outline-none sm:relative sm:top-0 sm:rounded-lg"
                  videoID={videoInfo.data.basic_info.id}
                  width={videoInfo.data.basic_info.embed?.width}
                  height={videoInfo.data.basic_info.embed?.height}
                  videoSeek={videoSeek}
                />
              )}
              <div className="flex flex-none flex-col px-4 sm:px-0 lg:w-1/3">
                <div className="lg:sticky lg:top-5">
                  {videoInfo.data.basic_info.embed?.iframe_url &&
                    horizontal && (
                      <VideoEmbed
                        className="w-full overflow-hidden outline-none sm:rounded-lg"
                        videoID={videoInfo.data.basic_info.id}
                        width={videoInfo.data.basic_info.embed?.width}
                        height={videoInfo.data.basic_info.embed?.height}
                        videoSeek={videoSeek}
                      />
                    )}
                  <VideoInfo
                    videoId={videoID}
                    title={videoInfo.data.basic_info.title}
                    views={videoInfo.data.basic_info.view_count}
                    likes={videoInfo.data.basic_info.like_count}
                    description={videoInfo.data.basic_info.short_description}
                    descriptionRuns={
                      videoInfo.data.basic_info.description?.runs
                    }
                    uploadDate={videoInfo.data.basic_info.upload_date}
                    channelName={videoInfo.data.basic_info.channel.name}
                    channelID={videoInfo.data.basic_info.channel_id}
                    channelSubscribers={
                      videoInfo.data.basic_info.channel.subscriber_count
                    }
                    channelThumbnail={
                      videoInfo.data.basic_info.channel.thumbnail
                    }
                    channelIsVerified={
                      videoInfo.data.basic_info.channel.is_verified
                    }
                    channelIsVerifiedArtist={
                      videoInfo.data.basic_info.channel.is_verified_artist
                    }
                    channelURL={videoInfo.data.basic_info.channel.url}
                  />
                </div>
              </div>
            </>
          ) : (
            (videoInfo.error || true) && "something went wrong"
          )}

          <div className="flex w-full flex-col gap-2 px-4 sm:px-0">
            {/* Display this outside of videoInfoLoader to grab sponsorsegments with videoID*/}
            <SponsorTranscripts
              videoID={videoID}
              captionTracks={videoInfo.data?.captions.caption_tracks}
              seekTo={seekTo}
            />
          </div>
        </div>

        <div className="px-4 py-4 sm:px-0">
          {videoInfo.isLoading ? (
            <GridVideoLoader />
          ) : (
            videoInfo.data?.watch_next &&
            (videoInfo.data.watch_next?.length ?? 0) > 0 && (
              <GridVideoView videos={videoInfo.data.watch_next} />
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
