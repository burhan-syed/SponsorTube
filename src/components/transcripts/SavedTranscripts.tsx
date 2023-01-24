import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import TranscriptEditWrapper from "./edits/TranscriptEditWrapper";
import type { Segment } from "sponsorblock-api";

// import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
// import  {type appRouter } from "@/server/trpc/router";
// type RouterOutput = inferRouterOutputs<typeof appRouter>;

const SavedTranscripts = ({
  segment,
  videoID,
  userPosts = false,
  setTabValue,
  setIsNavDisabled,
  seekTo,
}: {
  segment: Segment;
  videoID: string;
  userPosts?: boolean;
  setTabValue?(v: string): void;
  setIsNavDisabled?(d: boolean): void;
  seekTo(start: number, end: number): void;
}) => {
  const { data: sessionData } = useSession();
  const savedTranscriptAnnotations = trpc.transcript.get.useQuery(
    {
      segmentUUID: segment.UUID,
      mode: userPosts ? "user" : "score",
    },
    {
      enabled: !!segment.UUID && ((userPosts && !!sessionData) || !userPosts),
    }
  );

  return (
    <>
      {savedTranscriptAnnotations.isLoading ? (
        <div className="h-32 w-full animate-pulse rounded-lg bg-th-additiveBackground bg-opacity-5"></div>
      ) : savedTranscriptAnnotations.data ? (
        <>
          {savedTranscriptAnnotations.data.length > 0 ? (
            <>
              {savedTranscriptAnnotations?.data?.map((savedTranscripts) => (
                <>
                  <TranscriptEditWrapper
                    key={savedTranscripts.id}
                    segment={segment}
                    videoID={videoID}
                    transcript={{
                      text: savedTranscripts.text,
                      startTime: savedTranscripts?.startTime,
                      endTime: savedTranscripts?.endTime,
                      annotations:
                        savedTranscripts?.TranscriptDetails?.[0]?.Annotations,
                      id: savedTranscripts.id,
                      transcriptDetailsId:
                        savedTranscripts.TranscriptDetails?.[0]?.id,
                      annotaterId:
                        savedTranscripts.TranscriptDetails?.[0]?.userId ??
                        savedTranscripts?.userId ??
                        "",
                    }}
                    setTabValue={setTabValue}
                    setIsNavDisabled={setIsNavDisabled}
                    seekTo={seekTo}
                    initialVoteDirection={
                      savedTranscripts.TranscriptDetails?.[0]?.Votes?.[0]
                        ?.direction ?? 0
                    }
                  />
                </>
              ))}
            </>
          ) : (
            <>no saved transcripts</>
          )}
        </>
      ) : (
        <>?</>
      )}
    </>
  );
};

export default SavedTranscripts;
