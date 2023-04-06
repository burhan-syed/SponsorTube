import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { getChannel, ytSearchQuery } from "@/apis/youtube";
import ChannelHeader from "@/components/ui/channel/ChannelHeader";
import Header from "@/components/Header";
import GridVideoView from "@/components/ui/GridVideoView";
import GridVideoLoader from "@/components/ui/loaders/GridVideoLoader";
import { Button } from "@/components/ui/common/Button";
import ChannelStatsWrapper from "@/components/ui/channel/ChannelStatsWrapper";
import ChannelBannerLoader from "@/components/ui/loaders/channel/ChannelBannerLoader";
import ChannelHeaderLoader from "@/components/ui/loaders/channel/ChannelHeaderLoader";

import type { NextPage } from "next";

const ChannelPage: NextPage = () => {
  const router = useRouter();
  const channelID =
    (Array.isArray(router.query.channelID)
      ? router.query.channelID?.[0]
      : router.query.channelID) ?? "";
  const channel = api.channel.details.useInfiniteQuery(
    { channelID: channelID },
    {
      enabled: !!channelID,
      getNextPageParam: (lastPage) =>
        lastPage.hasNext ? lastPage.nextCursor : undefined,
    }
  );
  const flatVideos = channel.data?.pages?.map((p) => p.channelVideos).flat();

  return (
    <>
      <Head>
        <title>Video</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <section>
        {channel.isLoading ? (
          <ChannelBannerLoader />
        ) : (
          <>
            {channel.data?.pages?.[0]?.channelInfo &&
              channel.data?.pages?.[0]?.channelInfo?.banner?.url && (
                <Image
                  src={channel.data?.pages?.[0]?.channelInfo?.banner?.url}
                  height={channel.data?.pages?.[0]?.channelInfo.banner.height}
                  width={channel.data?.pages?.[0]?.channelInfo.banner.width}
                  alt=""
                  layout="responsive"
                  unoptimized={true}
                />
              )}
          </>
        )}

        <div className="mx-auto px-4 2xl:max-w-[192rem]">
          <div className="flex flex-col items-center justify-center p-2 md:flex-row md:justify-between md:p-6">
            {channel.isLoading ? (
              <ChannelHeaderLoader />
            ) : (
              <>
                {channel.data?.pages?.[0]?.channelInfo && (
                  <ChannelHeader
                    channel={channel.data?.pages?.[0]?.channelInfo}
                    channelId={channelID}
                  />
                )}
              </>
            )}
          </div>
          <ChannelStatsWrapper channelId={channelID} />
          <h2 className="invisible hidden">Channel Videos</h2>
          <div className="py-1 md:py-3"></div>
          {channel.isLoading ? (
            <GridVideoLoader />
          ) : (
            flatVideos &&
            flatVideos.length > 0 && <GridVideoView videos={flatVideos} />
          )}
          {channel.hasNextPage && (
            <div className="w-full items-center justify-center p-4 text-center">
              <Button
                loading={channel.isFetchingNextPage}
                disabled={channel.isFetchingNextPage || channel.isLoading}
                className=""
                onClick={() => channel.fetchNextPage()}
              >
                more
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const channelID =
    (Array.isArray(context.query.channelID)
      ? context.query.channelID?.[0]
      : context.query.channelID) ?? "";
  if (!channelID) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  try {
    if (channelID?.[0] === "@") {
      throw new Error("not an id");
    }
    const channel = await getChannel({ channelID: channelID });
  } catch (err) {
    //channel with id does not exist
    try {
      const search = await ytSearchQuery({ query: channelID });
      const channel = search?.channels?.[0]?.author.id;
      if (channel) {
        return {
          redirect: {
            destination: `/channel/${channel}`,
            permanent: false,
          },
        };
      }
    } catch (err) {
    } finally {
      return {
        redirect: {
          destination: `/search?q=${channelID}`,
          permanent: false,
        },
      };
    }
  }
  return {
    props: {},
  };
};

export default ChannelPage;
