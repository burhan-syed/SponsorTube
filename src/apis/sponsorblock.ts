import { SponsorBlock } from "sponsorblock-api";
import { Category, ResponseError } from "sponsorblock-api";
import type { SegmentUUID } from "sponsorblock-api/lib/types/segment/Segment";
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
    console.log("sponsorblock err?", videoID, err);
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

export const getSegmentsByID = async ({
  userID,
  UUIDs,
}: {
  userID: string;
  UUIDs: SegmentUUID[];
}) => {
  try {
    const sponsorBlock = new SponsorBlock(userID);
    const segmentInfo = await sponsorBlock.getSegmentInfo(UUIDs);
    return segmentInfo;
  } catch (err) {
    console.log("sponsorblock segments error?", userID, UUIDs, err);
  }
};
