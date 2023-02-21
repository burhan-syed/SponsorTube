import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import React from "react";

//keep these queries active for invalidation when on other tabs
const TranscriptQueryKeepAlive = ({
  segmentUUID,
}: {
  segmentUUID: string;
}) => {
  const { data: sessionData } = useSession();

  const generatedTranscriptAnnotations = trpc.transcript.get.useQuery(
    {
      segmentUUID: segmentUUID,
      mode: "generated",
    },
    {
      enabled: !!segmentUUID,
    }
  );
  const userTranscriptAnnotations = trpc.transcript.get.useQuery(
    {
      segmentUUID: segmentUUID,
      mode: "user",
    },
    {
      enabled: !!segmentUUID && !!sessionData?.user?.id,
    }
  );
  return <></>;
};

export default TranscriptQueryKeepAlive;
