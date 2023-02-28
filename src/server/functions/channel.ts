import Channel, {
  ChannelListContinuation,
} from "youtubei.js/dist/src/parser/youtube/Channel";
import RichItem from "youtubei.js/dist/src/parser/classes/RichItem";
import Video from "youtubei.js/dist/src/parser/classes/Video";
import type RichGrid from "youtubei.js/dist/src/parser/classes/RichGrid";
import type { YTNode } from "youtubei.js/dist/src/parser/helpers";

export const getVideosContinuation = async ({
  videosTab,
  cursor,
}: {
  videosTab: Channel | ChannelListContinuation;
  cursor?: number | null;
}) => {
  let hasNext = false;
  const nextCursor = (cursor ?? 1) + 1;
  let isContinuation = false;
  let videos: Video[] = [];
  if ((videosTab as Channel)?.current_tab) {
    const richItems = (
      (videosTab as Channel).current_tab?.content as RichGrid
    ).contents.filterType(RichItem);
    videos = richItems
      .filter((richItem) => richItem.content?.is(Video))
      .map((richItem) => richItem.content) as Video[];
  } else if ((videosTab as ChannelListContinuation)?.contents) {
    isContinuation = true;
  }

  console.log({ isContinuation });

  hasNext = videosTab.has_continuation;
  if (hasNext) {
    //(cursor ?? 0) > 0 || isContinuation
    let continuation = await videosTab.getContinuation();
    if (!isContinuation) {
      for (let i = 1; i < (cursor ?? 0); i++) {
        if ((cursor ?? -1) > i) {
          continuation = await continuation.getContinuation();
        }
      }
    }

    hasNext = continuation.has_continuation;
    const continuationVods = continuation.contents?.contents
      ?.filterType(RichItem)
      .filter((richItem) => richItem.content?.is(Video))
      .map((richItem) => richItem.content) as Video[];

    if (!cursor || isContinuation) {
      videos = [...videos, ...continuationVods];
    } else {
      videos = continuationVods;
    }

    return { videos, hasNext, continuation, nextCursor };
  }

  return { videos, hasNext, nextCursor, continuation: null };
};
