// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db";
import {
  GetSegmentAnnotationsSchema,
  getSegmentAnnotationsOpenAICall,
} from "@/server/db/bots";

const secret = process.env.MY_SECRET_KEY;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.headers.authorization !== secret) {
    res.status(401).send("unauthorized");
    return;
  }
  console.log(
    "Segment processing Lambda?",
    req?.body?.videoId,
    req?.body?.segment?.UUID
  );

  try {
    const input = GetSegmentAnnotationsSchema.parse(req.body);
    await getSegmentAnnotationsOpenAICall({
      input: input,
      ctx: { prisma, session: null },
    });
    res.send("segment processed");
  } catch (err) {
    res.send({ error: "something went wrong" });
  }
};

export default handler;
