import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import TranscriptEditWrapper from "./edits/TranscriptEditWrapper";
import type { Segment } from "sponsorblock-api";
import TranscriptLoader from "../ui/loaders/transcripts/TranscriptLoader";
import TranscriptTopBar from "./TranscriptTopBar";

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
  const savedTranscriptAnnotations = api.transcript.get.useQuery(
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
        <TranscriptLoader />
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
              <div className="flex flex-wrap items-center justify-between gap-x-2 rounded-b-lg bg-th-baseBackground px-2 text-xs text-th-textSecondary">
                <span>
                  {`These annotations were manually submitted${
                    userPosts ? " by you." : ""
                  }`}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-grow flex-col">
              <TranscriptTopBar
                seekTo={seekTo}
                videoID={videoID}
                segmentUUID={segment.UUID}
                transcript={{
                  startTime: segment.startTime,
                  endTime: segment.endTime,
                }}
              />
              <p className="flex h-full w-full flex-grow items-center justify-center">
                {userPosts
                  ? "found no submitted segments"
                  : "no saved segments found"}
              </p>
            </div>
          )}
        </>
      ) : (
        <>?</>
      )}
    </>
  );
};

export default SavedTranscripts;
