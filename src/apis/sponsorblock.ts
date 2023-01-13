import { SponsorBlock } from "sponsorblock-api";
import { Category, ResponseError } from "sponsorblock-api";

export const getVideoSegments = async ({
  userID,
  videoID,
  categories = ["sponsor"],
}: {
  userID: string;
  videoID: string | undefined;
  categories?: Category[];
}) => {
  if (!videoID) {
    throw new Error("missing video id");
  }
  const sponsorBlock = new SponsorBlock(userID); // userID should be a locally generated uuid, save the id for future tracking of stats
  try {
    const segments = await sponsorBlock.getSegments(videoID, categories);
    return segments;
  } catch (err) {
    if (err instanceof ResponseError) {
      // console.log("segment fetch err", videoID, err)
      switch (err.message) {
        default:
          return [];
      }
    }
    throw err;
  }
};
