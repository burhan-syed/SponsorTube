import { YTNodes } from "youtubei.js";
import { ChannelCardInfo, VideoCardInfo } from "@/types/schemas";

export const transformInnerTubeVideoToVideoCard = (
  v: YTNodes.Video | YTNodes.CompactVideo
) => {
  const vCard: VideoCardInfo = {
    id: v.id,
    title: v.title?.text ?? v.title.runs?.[0]?.text,
    viewCountString: v.short_view_count.text,
    publishedString: v.published.text,
    shortDescription: (v as YTNodes.Video)?.snippets?.[0]?.text?.text,
    thumbnail: v.thumbnails?.[0]?.url
      ? {
          url: v.thumbnails[0].url,
          height: v.thumbnails[0]?.height,
          width: v.thumbnails[0]?.width,
        }
      : undefined,
    author: {
      id: v.author.id,
      name: v.author.name,
      thumbnail: v.author.thumbnails?.[0]?.url
        ? {
            url: v.author.thumbnails?.[0]?.url,
            height: v.author.thumbnails?.[0]?.height,
            width: v.author.thumbnails?.[0]?.width,
          }
        : undefined,
    },
  };
  return vCard;
};

export const transformInnerTubeChannelToChannelCard = (c: YTNodes.Channel) => {
  const cCard: ChannelCardInfo = {
    id: c.id,
    name: c.author.name,
    thumbnail: c.author.thumbnails?.[0]?.url
      ? {
          url: c.author.thumbnails[0].url,
          height: c.author.thumbnails[0]?.height,
          width: c.author.thumbnails[0]?.width,
        }
      : undefined,
    shortDescription: c.description_snippet.text,
    subscriberCountText: c.subscribers.text,
    videoCountText: c.videos.text,
  };
  return cCard;
};
