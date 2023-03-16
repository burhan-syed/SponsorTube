// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";
import { summarizeChannelSponsors } from "@/server/db/sponsors";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const secret = process.env.MY_SECRET_KEY;
  if (req.headers.authorization !== secret) {
    res.status(401).send("unauthorized");
    return;
  }
  try {
    const channelId = req.body?.channelId;
    if (!channelId) {
      throw new Error("Missing channelId");
    }
    res.send("channel summary started")
    await summarizeChannelSponsors({
      channelId,
      ctx: { prisma, session: null },
    });
    //res.send("channel summarized");
  } catch (err) {
    res.send({ error: "something went wrong" });
  }
};

export default handler;
