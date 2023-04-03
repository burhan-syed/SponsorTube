import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import React from "react";

//keep these queries active for invalidation when on other tabs
const TranscriptQueryKeepAlive = ({
  segmentUUID,
}: {
  segmentUUID: string;
}) => {
  const { data: sessionData } = useSession();

  const generatedTranscriptAnnotations = api.transcript.get.useQuery(
    {
      segmentUUID: segmentUUID,
      mode: "generated",
    },
    {
      enabled: !!segmentUUID,
    }
  );
  const userTranscriptAnnotations = api.transcript.get.useQuery(
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
