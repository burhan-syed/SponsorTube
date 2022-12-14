import { trpc } from "@/utils/trpc";
import React from "react";
import TranscriptEditWrapper from "./edits/TranscriptEditWrapper";
import TranscriptVote from "./TranscriptVote";

// import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
// import  {type appRouter } from "@/server/trpc/router";
// type RouterOutput = inferRouterOutputs<typeof appRouter>;

const SavedTranscripts = ({
  segmentUUID,
  userPosts = false,
  setTabValue,
}: {
  segmentUUID: string;
  userPosts?: boolean;
  setTabValue?(v: string): void;
}) => {
  const savedTranscriptAnnotations = trpc.transcript.get.useQuery(
    {
      segmentUUID,
      userPosts,
    },
    {
      enabled: !!segmentUUID,
    }
  );

  return (
    <div className="bg-green-50 p-4">
      {savedTranscriptAnnotations.isLoading
        ? "waiting for db transcripts.."
        : savedTranscriptAnnotations?.data
        ? `db transcripts: ${savedTranscriptAnnotations.data?.length}`
        : savedTranscriptAnnotations.error
        ? "error fetching db transcripts"
        : "something went wrong fetching db transcripts"}
      <span>saved</span>
      {savedTranscriptAnnotations?.data?.map((savedTranscripts) => (
        <>
          {`(details id: ${savedTranscripts.TranscriptDetails?.[0]?.id} [${savedTranscripts.TranscriptDetails?.[0]?.score} | ${savedTranscripts.score}])`}
          {savedTranscripts.TranscriptDetails?.[0]?.id && (
            <TranscriptVote
              transcriptDetailsId={savedTranscripts.TranscriptDetails?.[0]?.id}
              initialDirection={
                savedTranscripts.TranscriptDetails?.[0]?.Votes?.[0]
                  ?.direction ?? 0
              }
              transcriptId={savedTranscripts.id}
            />
          )}

          <TranscriptEditWrapper
            key={savedTranscripts.id}
            transcript={{
              segmentUUID: segmentUUID,
              text: savedTranscripts.text,
              startTime: savedTranscripts?.startTime,
              endTime: savedTranscripts?.endTime,
              annotations:
                savedTranscripts?.TranscriptDetails?.[0]?.Annotations,
              id: savedTranscripts.id,
              transcriptDetailsId: savedTranscripts.TranscriptDetails?.[0]?.id,
            }}
            setTabValue={setTabValue}
          />
          <span>
            {savedTranscripts.startTime}:{savedTranscripts.endTime}
          </span>
        </>
      ))}
    </div>
  );
};

export default SavedTranscripts;
