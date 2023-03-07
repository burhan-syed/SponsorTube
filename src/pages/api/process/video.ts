// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";
import { processVideo } from "@/server/functions/process";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const secret = process.env.MY_SECRET_KEY;
  if (req.headers.authorization !== secret) {
    res.status(401).send("unauthorized");
    return;
  }
  try {
    const videoId = req.body?.videoId;
    if (!videoId) {
      throw new Error("Missing videoId");
    }
    await processVideo({
      videoId,
      ctx: { prisma, session: null },
      options: {
        spawnProcess: false,
      },
    });
    res.send("video processed");
  } catch (err) {
    res.send({ error: "something went wrong" });
  }
};

export default handler;
