// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";
import {
  processChannelVideoTranscriptAnnotations,
  spawnAnnotateChannelVideosProcess,
} from "@/server/functions/process";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const secret = process.env.MY_SECRET_KEY;
  if (req.headers.authorization !== secret) {
    res.status(401).send("unauthorized");
    return;
  }
  try {
    const channelId = req.body?.channelId;
    const queueId = req.body?.queueId;
    const continueQueue = req.body?.continueQueue ?? "false";

    if (!channelId) {
      throw new Error("Missing channelId");
    }
    let earlyReturn = false;
    await Promise.race([
      (async () => {
        console.log("run?", channelId);
        const r = await processChannelVideoTranscriptAnnotations({
          channelId,
          parentQueueId: queueId,
          continueQueue: JSON.parse(continueQueue),
          stopAt: new Date(new Date().getTime() + 40 * 1000),
          ctx: { prisma, session: null },
        });
        if (r) {
          earlyReturn = true;
        }
      })(),
      new Promise((resolve) =>
        setTimeout((v) => {
          earlyReturn = true;
          resolve(v);
        }, 50 * 1000)
      ),
    ]);
    if (earlyReturn) {
      await spawnAnnotateChannelVideosProcess({
        channelId,
        queueId,
        continueQueue: true,
      });
      res.send("channel segments continued");
    } else {
      res.send("channel segments done");
    }
  } catch (err) {
    res.send({ error: "something went wrong" });
  }
};

export default handler;
