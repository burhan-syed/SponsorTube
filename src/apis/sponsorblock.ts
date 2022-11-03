import { SponsorBlock } from "sponsorblock-api";
import type { Category } from "sponsorblock-api";

export const getVideoSegments = async ({
  userID,
  videoID,
  categories = ["sponsor"],
}: {
  userID: string;
  videoID: string | undefined;
  categories?: Category[];
}) => {
  if (!videoID){
    throw new Error("missing video id")
  }
  const sponsorBlock = new SponsorBlock(userID); // userID should be a locally generated uuid, save the id for future tracking of stats
  const segments = await sponsorBlock.getSegments(videoID, categories);
  return segments;
};
