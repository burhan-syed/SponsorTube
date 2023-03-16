// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Innertube from "youtubei.js";
import { Platform } from "youtubei.js";
const SERVER_URL = process.env.SERVER_URL;

const InnerTubeSettings = {
  fetch: async (input:any, init:any) => {
    const url =
      typeof input === "string"
        ? new URL(input)
        : input instanceof URL
        ? input
        : new URL(input.url);

    const headers = init?.headers
      ? new Headers(init.headers)
      : input instanceof Request
      ? input.headers
      : new Headers();

    const arr_headers = [...headers];

    const body_contents = init?.body
      ? typeof init.body === "string"
        ? headers.get("content-type") === "application/json"
          ? JSON.stringify(JSON.parse(init.body), null, 2) // Body is string and json
          : init.body // Body is string
        : "    <binary>" // Body is not string
      : "    (none)"; // No body provided

    const headers_serialized =
      arr_headers.length > 0
        ? `${arr_headers
            .map(([key, value]) => `    ${key}: ${value}`)
            .join("\n")}`
        : "    (none)";

    // console.log(
    //   "YouTube.js Fetch:\n" +
    //     `  url: ${url.toString()}\n` +
    //     `  method: ${init?.method || "GET"}\n` +
    //     `  headers:\n${headers_serialized}\n' + 
    // '  body:\n${body_contents}`
    // );

    return Platform.shim.fetch(input, init);
  },
  /* fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    // url
    const url =
      typeof input === "string"
        ? new URL(input)
        : input instanceof URL
        ? input
        : new URL(input.url);

    // transform the url for use with our proxy
    url.searchParams.set("__host", url.host);
    url.host = "localhost:3000";
    url.protocol = "http";
    url.pathname = "/api/ytproxy"
    //url.href = `${url.protocol}//${url.host}/api/ytproxy`

    const headers = init?.headers
      ? new Headers(init.headers)
      : input instanceof Request
      ? input.headers
      : new Headers();

    // now serialize the headers
    url.searchParams.set("__headers", JSON.stringify([...headers]));

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    input.duplex = "half";

    // copy over the request
    const request = new Request(
      url,
      input instanceof Request ? input : undefined
    );

    headers.delete("user-agent");
    console.log("POST?", request.url);
    // fetch the url
    return fetch(
      request,
      init
        ? {
            ...init,
            headers,
          }
        : {
            headers,
          }
    );
  }, */
};

export const getVideoInfo = async ({ videoID }: { videoID: string }) => {
  try {
    const yt = await Innertube.create(InnerTubeSettings);
    const details = await yt.getInfo(videoID);
    return details;
  } catch (err) {
    console.error("INNERTUBE VIDEO INFO ERROR: ", { videoID }, err);
  }
};

export const ytSearchQuery = async ({ query }: { query: string }) => {
  // console.log("s?", query);
  try {
    const yt = await Innertube.create(InnerTubeSettings);
    const details = await yt.search(query);
    // console.log("D?", details);
    return details;
  } catch (err) {
    console.error("INNERTUBE SEARCH ERROR: ", { query }, err);
  }
};

export const ytAutoComplete = async ({ query }: { query: string }) => {
  try {
    const yt = await Innertube.create(InnerTubeSettings);
    const results = await yt.getSearchSuggestions(query);
    return results;
  } catch (err) {
    console.error("INNERTUBE AUTOCOMPLETE ERR: ", { query }, err);
  }
};

export const getChannel = async ({ channelID }: { channelID: string }) => {
  try {
    const yt = await Innertube.create(InnerTubeSettings);
    const channel = await yt.getChannel(channelID);
    return channel;
  } catch (err) {
    console.error("INNERTUBE CHANNEL ERR: ", { channelID }, err);
  }
};
