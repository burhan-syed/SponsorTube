import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Header from "@/components/Header";
import VideoInfo from "@/components/video/VideoInfo";
import VideoEmbed from "@/components/video/VideoEmbed";
import SponsorTranscripts from "@/components/transcripts/SponsorTranscripts";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import VideoPageLoader from "@/components/ui/loaders/VideoPageLoader";
import GridVideoView from "@/components/video/GridVideoView";
import GridVideoLoader from "@/components/ui/loaders/GridVideoLoader";
import AutoAnnotateAll from "@/components/transcripts/AutoAnnotateAll";

const Home: NextPage = ({}) => {
  const router = useRouter();
  const { v } = router.query;
  const videoID = (Array.isArray(v) ? v?.[0] : v) ?? "";
  const videoInfo = api.video.info.useQuery(
    { videoID },
    {
      enabled: !!videoID,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

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
                  className="sticky top-12 z-20 w-full overflow-hidden outline-none "
                  videoID={videoInfo?.data.id}
                  width={videoInfo?.data?.embed?.width}
                  height={videoInfo?.data?.embed?.height}
                  videoSeek={videoSeek}
                  scaleHeight={true}
                />
              )}
              <div className="flex flex-none flex-col px-4 sm:px-0 lg:w-1/3">
                <div className="lg:sticky lg:top-14">
                  {videoInfo?.data?.embed?.url && horizontal && (
                    <VideoEmbed
                      className="w-full overflow-hidden outline-none sm:rounded-lg"
                      videoID={videoInfo.data.id}
                      width={videoInfo.data.embed.width}
                      height={videoInfo.data.embed.height}
                      videoSeek={videoSeek}
                    />
                  )}
                  <VideoInfo videoId={videoID} info={videoInfo.data} />
                </div>
              </div>
            </>
          ) : (
            (videoInfo.error || true) && "something went wrong"
          )}

          <div className="flex w-full flex-col gap-2 px-4 sm:px-0">
            {/* Display this outside of videoInfoLoader to grab sponsorsegments with videoID*/}
            <AutoAnnotateAll
              videoId={videoInfo.data?.id}
              isLoading={videoInfo.isLoading}
            />
            <SponsorTranscripts
              videoID={videoID}
              captionTracks={videoInfo?.data?.captions}
              seekTo={seekTo}
            />
          </div>
        </div>

        <div className="px-4 py-4 sm:px-0">
          {videoInfo.isLoading ? (
            <GridVideoLoader />
          ) : (
            videoInfo.data?.watchNextVideos &&
            (videoInfo.data.watchNextVideos?.length ?? 0) > 0 && (
              <GridVideoView videos={videoInfo.data.watchNextVideos} />
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
