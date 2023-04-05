import { YTNodes } from "youtubei.js/agnostic";
import { VideoCardInfo } from "@/types/schemas";

export const InnerTubeVideoToVideoCard = (v: YTNodes.Video) => {
  const vCard: VideoCardInfo = {
    id: v.id,
    title: v.title?.text ?? v.title.runs?.[0]?.text,
    viewCountString: v.short_view_count.text,
    publishedString: v.published.text,
    shortDescription: v.snippets?.[0]?.text?.text,
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
