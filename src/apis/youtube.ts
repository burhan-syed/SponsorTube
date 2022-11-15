import Innertube from "youtubei.js";

export const getVideoInfo = async ({ videoID }: { videoID: string }) => {
  const yt = await Innertube.create();
  const details = await yt.getInfo(videoID);
  return details;
};

export const ytSearchQuery = async ({ query }: { query: string }) => {
  const yt = await Innertube.create();
  const details = await yt.search(query);
  return details;
};

export const getChannel = async ({channelID}: {channelID: string} ) => {
  const yt = await Innertube.create(); 
  const channel = await yt.getChannel(channelID);
  return  channel;
}
