import Innertube from "youtubei.js";

export const getVideoInfo = async ({ videoID }: { videoID: string }) => {
  try {
    const yt = await Innertube.create({});
    const details = await yt.getInfo(videoID);
    return details;
  } catch (err) {
    console.error("INNERTUBE VIDEO INFO ERROR: ", { videoID }, err);
  }
};

export const ytSearchQuery = async ({ query }: { query: string }) => {
  // console.log("s?", query);
  try {
    const yt = await Innertube.create({});
    const details = await yt.search(query);
    // console.log("D?", details);
    return details;
  } catch (err) {
    console.error("INNERTUBE SEARCH ERROR: ", { query }, err);
  }
};

export const ytAutoComplete = async ({ query }: { query: string }) => {
  try {
    const yt = await Innertube.create({});
    const results = await yt.getSearchSuggestions(query);
    return results;
  } catch (err) {
    console.error("INNERTUBE AUTOCOMPLETE ERR: ", { query }, err);
  }
};

export const getChannel = async ({ channelID }: { channelID: string }) => {
  try {
    const yt = await Innertube.create({});
    const channel = await yt.getChannel(channelID);
    return channel;
  } catch (err) {
    console.error("INNERTUBE CHANNEL ERR: ", { channelID }, err);
  }
};
