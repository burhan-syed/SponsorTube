import { z } from "zod";



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

const ChannelCardSchema = AuthorSchema.extend({
  subscriberCountText: z.string().optional(), 
  videoCountText: z.string().optional(), 
  shortDescription: z.string().optional(),
})

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

export type ChannelCardInfo = z.infer<typeof ChannelCardSchema>;
export type VideoCardInfo = z.infer<typeof VideoCardSchema>;
