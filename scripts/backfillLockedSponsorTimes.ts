import { PrismaClient } from "@prisma/client";
import csv from "csv-parser";
import fs from "fs";
import path from "path";

import type { SponsorTimes, SponsorCategories } from "@prisma/client";

type ImportSponsorTime = {
  videoID: string;
  startTime: string;
  endTime: string;
  votes: string;
  locked: string;
  incorrectVotes: string;
  UUID: string;
  userID: string;
  timeSubmitted: string;
  views: string;
  category: string;
  actionType: string;
  service: string;
  videoDuration: string;
  hidden: string;
  reputation: string;
  shadowHidden: string;
  hashedVideoID: string;
  userAgent: string;
  description: string;
};

const prisma = new PrismaClient({ log: ["info", "warn"] });
const results = [] as SponsorTimes[][]; //new Map<number,SponsorTimes[]>();
let totalCount = 0;
let totalCreated = 0;
let adjustedCount = 0;
const ROWSPERGROUP = 10000;
const ROWSTARTNO = 0;
const parseRow = async (row: ImportSponsorTime) => {
  totalCount += 1;

  if (
    totalCount >= ROWSTARTNO &&
    row.category === "sponsor" &&
    row.locked === "1"
  ) {
    adjustedCount += 1;

    const parsed = {
      UUID: row.UUID,
      category: row.category as unknown as SponsorCategories,
      videoID: row.videoID,
      startTime: parseFloat(row.startTime),
      endTime: parseFloat(row.endTime),
      votes: parseInt(row.votes),
      locked: row.locked === "1" ? true : false,
      incorrectVotes: parseInt(row.incorrectVotes),
      userID: row.userID,
      timeSubmitted: new Date(parseInt(row.timeSubmitted)),
      views: parseInt(row.views),
      actionType: row.actionType,
      service: row.service,
      videoDuration: parseFloat(row.videoDuration),
      hidden: row.hidden === "1" ? true : false,
      reputation: parseFloat(row.reputation),
      shadowHidden: row.shadowHidden === "1" ? true : false,
      hashedVideoID: row.hashedVideoID,
      userAgent: row.userAgent,
      description: row.description,
    };
    const groupNo = Math.floor(adjustedCount / (ROWSPERGROUP + 1));
    if (results && results?.[groupNo] && Array.isArray(results[groupNo])) {
      results[groupNo]?.push(parsed);
    } else {
      results.push([parsed]);
    }
    // console.log(
    //   `pushed ${adjustedCount} (${groupNo}:${results[groupNo]?.length}): `,
    //   parsed.UUID
    // );

    if (results?.[groupNo]?.length === ROWSPERGROUP) {
      insertIntoDB(groupNo);
    }
  } else {
    if (totalCount < ROWSTARTNO) {
      console.log("skip ", totalCount);
    }
  }
};

const insertIntoDB = async (groupNo: number) => {
  console.log(
    `inserting ${adjustedCount} (${groupNo}:${results[groupNo]?.length}): `
  );
  const create = await prisma.sponsorTimes.createMany({
    data: results[groupNo] as SponsorTimes[],
    skipDuplicates: true,
  });
  totalCreated += create.count;
  console.log("created ", create.count);
  console.log("total created ", totalCreated);

  //clear results array https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
  while (results?.[groupNo] && (results?.[groupNo]?.length ?? 0) > 0) {
    results[groupNo]?.pop();
  }
};

const main = async () => {
  fs.createReadStream(path.join(__dirname, "./data/sponsorTimes.csv"))
    .pipe(csv())
    .on("data", async (data) => {
      //console.log("row ", data?.["UUID"]);
      if (data?.["UUID"]) {
        await parseRow(data);
      }
    })
    .on("end", async () => {
      console.log("Finished parsing csv");
      console.log("Total rows: " + totalCount);
      console.log("Adjusted count:" + adjustedCount);
      console.log("Writing last rows");

      await Promise.all(
        results.map(async (group, i) => {
          if (group.length > 0) {
            await insertIntoDB(i);
          }
        })
      );

      console.log("Total Created:" + totalCreated);
    });
};

main().catch((e) => {
  console.error(e);
  console.log("total Rows: ", totalCount);
});
