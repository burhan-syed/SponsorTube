
import { TranscriptAnnotations } from "@prisma/client";
import type Video from "youtubei.js/dist/src/parser/classes/Video";

export interface VideoWithThumbnail extends Video {
  video_thumbnail?: {
    url: string, 
    height: number, 
    width: number,
  } | undefined
}

export type Transcript = {
  text: string;
  annotations?: TranscriptAnnotations[];
  id?: string;
  transcriptDetailsId?: string;
  annotaterId?: string;
  startTime?: number | null;
  endTime?: number | null;
};