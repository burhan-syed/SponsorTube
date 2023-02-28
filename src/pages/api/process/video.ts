// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";
import { processVideo } from "@/server/functions/process";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const videoId = req.body?.videoId;
    if (!videoId) {
      throw new Error("Missing videoId");
    }
    await processVideo({
      videoId,
      ctx: { prisma, session: null },
      options: {
        callServer: true,
      },
    });
    console.log("video processing", videoId);
    res.send("");
  } catch (err) {
    res.send({ error: "invalid post body" });
  }
};

export default handler;
