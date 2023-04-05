import { z } from "zod";

const ChannelCardSchema = z.object({});

const ThumbnailSchema = z.object({
  url: z.string(),
  height: z.number().optional(),
  width: z.number().optional(),
});

const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  thumbnail: ThumbnailSchema.optional(),
});

export const VideoCardSchema = z.object({
  id: z.string(),
  thumbnail: ThumbnailSchema.optional(),
  author: AuthorSchema.optional(),
  title: z.string().optional(),
  publishedString: z.string().optional(),
  publishedDate: z.date().optional(),
  viewCountString: z.string().optional(),
  viewCount: z.number().optional(),
  shortDescription: z.string().optional(),
});

export type VideoCardInfo = z.infer<typeof VideoCardSchema>;
