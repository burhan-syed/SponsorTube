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
import ScrollTextHeader from "@/components/ui/animation/ScrollTextHeader";

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
        <title>
          {(videoInfo?.data?.title ?? "Video") +
            " | Identify YouTube Video Sponsors SponsorTube"}
        </title>
        <meta name="description" content="Identify video sponsor information" />
      </Head>
      <div>
        <Header />
        <section className="relative mx-auto sm:px-4 md:px-[5vw] 2xl:max-w-[192rem] ">
          <div className="flex flex-col gap-2 md:mx-4 lg:flex-row lg:gap-4">
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
              <div className="flex flex-none flex-col gap-2 lg:w-1/3">
                <div className="skeleton-box aspect-video w-full rounded-lg"></div>
                <p>
                  unable to find video information <br />
                  <span className="text-th-textSecondary">
                    video id: {videoID}
                  </span>
                </p>
              </div>
            )}

            <div className="flex w-full flex-col gap-2 px-4 sm:px-0">
              <h2 className="sr-only  font-semibold md:not-sr-only md:text-lg">
                Sponsored Segment Transcripts
              </h2>
              <SponsorTranscripts
                videoID={videoID}
                videoDuration={
                  videoInfo?.isLoading ? 0 : videoInfo.data?.duration
                }
                captionTracks={videoInfo?.data?.captions}
                seekTo={seekTo}
              />
            </div>
          </div>
        </section>
        <section className="relative my-2 lg:my-4">
          <ScrollTextHeader
            text="Related Videos"
            loading={videoInfo.isLoading}
            className="px-2 md:px-[calc(5vw+1.6rem-8px)] 2xl:max-w-[192rem]"
            innerClassName=""
            innerContainerSizePercent={1.1}
          />

          <div className="pt-2 lg:pt-0"></div>
          <div className="mx-auto px-2  md:px-[calc(5vw+1.6rem-8px)]  2xl:max-w-[192rem] ">
            {videoInfo.isLoading ? (
              <GridVideoLoader />
            ) : (
              videoInfo.data?.watchNextVideos &&
              (videoInfo.data.watchNextVideos?.length ?? 0) > 0 && (
                <GridVideoView videos={videoInfo.data.watchNextVideos} />
              )
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
