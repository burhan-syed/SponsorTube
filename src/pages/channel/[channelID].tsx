import Head from "next/head";
import { useRouter } from "next/router";
import ChannelHeader from "../../components/ui/ChannelHeader";
import Header from "../../components/ui/Header";
import VideoCard from "../../components/ui/VideoCard";
import { trpc } from "../../utils/trpc";

import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import { getChannel, ytSearchQuery } from "../../apis/youtube";
import GridVideoView from "@/components/ui/GridVideoView";
import GridVideoLoader from "@/components/ui/loaders/GridVideoLoader";

const ChannelPage: NextPage = () => {
  const router = useRouter();
  const channelID =
    (Array.isArray(router.query.channelID)
      ? router.query.channelID?.[0]
      : router.query.channelID) ?? "";
  const channel = trpc.channel.details.useQuery(
    { channelID: channelID },
    {
      enabled: !!channelID,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );
  console.log("channel?", channel.data);
  return (
    <>
      <Head>
        <title>Video</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div>
        {channel.data?.channelHeader && (
          <ChannelHeader channel={channel.data?.channelHeader} />
        )}
        {channel.isLoading ? (
          <GridVideoLoader />
        ) : (
          channel.data?.channelVideos &&
          channel.data.channelVideos.length > 0 && (
            <GridVideoView videos={channel.data.channelVideos} />
          )
        )}
      </div>
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
    const channel = await getChannel({ channelID: channelID });
  } catch (err) {
    //channel with id does not exist
    const search = await await ytSearchQuery({ query: channelID });
    const channel = search?.channels[0]?.author.id;
    if (channel) {
      return {
        redirect: {
          destination: `/channel/${channel}`,
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
