// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/client";
import {
  GetSegmentAnnotationsSchema,
  getSegmentAnnotationsOpenAICall,
} from "@/server/db/bots";
import { updateVideoSponsorsFromDB } from "@/server/db/sponsors";

const secret = process.env.MY_SECRET_KEY;


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("REQ?", req.headers)

  if(req.headers.authorization !== secret){
    res.status(401).send("unauthorized");
    return;
  }
  try {
    console.log("processing", req.body);
    const input = GetSegmentAnnotationsSchema.parse(req.body);
    await getSegmentAnnotationsOpenAICall({
      input: input,
      ctx: { prisma, session: null },
    });
    await updateVideoSponsorsFromDB({ videoId: input.videoId });
    console.log("Segment processed");
    res.send("segment processed");
  } catch (err) {
    res.send({ error: "invalid post body" });
  }
};

export default handler;
