import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import React from "react";

const useTranscriptQuery = ({ segmentUUID }: { segmentUUID: string }) => {
  const { data: sessionData, status } = useSession();

  const generatedTranscriptAnnotations = api.transcript.get.useQuery(
    {
      segmentUUID: segmentUUID,
      mode: "generated",
    },
    {
      enabled: !!segmentUUID && status !== "loading",
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
  const savedTranscriptAnnotations = api.transcript.get.useQuery(
    {
      segmentUUID: segmentUUID,
      mode: "score",
    },
    {
      enabled: !!segmentUUID,
    }
  );

  return {
    savedTranscriptAnnotations,
    generatedTranscriptAnnotations,
    userTranscriptAnnotations,
  };
};

export default useTranscriptQuery;
