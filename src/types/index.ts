
import type Video from "youtubei.js/dist/src/parser/classes/Video";

export interface VideoWithThumbnail extends Video {
  video_thumbnail?: {
    url: string, 
    height: number, 
    width: number,
  } | undefined
}