import { PrismaClient } from "@prisma/client";
import csv from "csv-parser";
import fs from "fs";
import path from "path";

import type { SponsorTimes } from "@prisma/client";

//last ran on 03/29/2023
const PROCESS_TO_DATE = new Date("01/01/2022");

const prisma = new PrismaClient({ log: ["info", "warn"] });
const results = [] as SponsorTimes[][]; //new Map<number,SponsorTimes[]>();
let totalRowsCount = 0;
let totalCreated = 0;
let adjustedCount = 0;
const ROWSPERGROUP = 1000;
const ROWSTARTNO = 0;
const parseRow = async (row: SponsorTimes) => {
  adjustedCount += 1;
  const groupNo = Math.floor(adjustedCount / (ROWSPERGROUP + 1));
  if (results && results?.[groupNo] && Array.isArray(results[groupNo])) {
    results[groupNo]?.push(row);
  } else {
    results.push([row]);
  }
  if (results?.[groupNo]?.length === ROWSPERGROUP) {
    insertIntoDB(groupNo);
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
  //totalCreated += results?.[groupNo]?.length ?? 0;
  //console.log("created ", create.count);
  console.log("total created ", totalCreated);

  //clear results array; best method discussed https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
  if (results?.[groupNo] && results?.[groupNo]?.length) {
    results[groupNo] = [];
  }
  console.log(`cleared? (${groupNo}:${results[groupNo]?.length})`);
};

const main = async () => {
  console.log("PROCESSING TO ", PROCESS_TO_DATE);

  const readStream = fs
    .createReadStream(path.join(__dirname, "./data/sponsorTimes.csv"))
    .pipe(
      csv({
        headers: [
          "videoID",
          "startTime",
          "endTime",
          "votes",
          "locked",
          "incorrectVotes",
          "UUID",
          "userID",
          "timeSubmitted",
          "views",
          "category",
          "actionType",
          "service",
          "videoDuration",
          "hidden",
          "reputation",
          "shadowHidden",
          "hashedVideoID",
          "userAgent",
          "description",
        ],
        skipLines: 0,
        mapValues: ({ header, index, value }) => {
          switch (header) {
            case "startTime":
            case "endTime":
            case "reputation":
            case "videoDuration":
              return parseFloat(value);
            case "votes":
            case "incorrectVotes":
            case "views":
              return parseInt(value);
            case "locked":
            case "hidden":
            case "shadowHidden":
              return value === "1" ? true : false;
            case "timeSubmitted":
              return new Date(parseInt(value));
            default:
              return value;
          }
        },
      })
    );

  readStream.on("data", async (row: SponsorTimes) => {
    totalRowsCount++;
    if (
      row?.["UUID"] &&
      row?.["category"] === "sponsor" &&
      row?.locked &&
      row.timeSubmitted &&
      row.timeSubmitted >= PROCESS_TO_DATE
    ) {
      // console.log(
      //   ">>>>found",
      //   row?.UUID,
      //   row?.timeSubmitted,
      //   row.timeSubmitted > PROCESS_TO_DATE
      // );
      parseRow(row);
    } else if (row.timeSubmitted) {
      // console.log(
      //   "skip",
      //   row.timeSubmitted,
      //   PROCESS_TO_DATE,
      //   row.timeSubmitted > PROCESS_TO_DATE
      // );
    } else {
      console.log("NO TIME SUBMITTED");
    }

    // if (totalRowsCount >= 10000000) {
    //   readStream.destroy();
    // }
  });

  readStream.on("end", async () => {
    console.log("Finished parsing csv");
    console.log("Total rows: " + totalRowsCount);
    console.log("Total Created:" + totalCreated);
    console.log("Writing last rows");

    await Promise.allSettled(
      results.map(async (group, i) => {
        if (group.length > 0) {
          await insertIntoDB(i);
        }
      })
    );

    //console.log("Total Created:" + totalCreated);
  });
};

main().catch((e) => {
  console.error(e);
  console.log("total Rows: ", totalRowsCount);
  console.log("total Created", totalCreated);
});
