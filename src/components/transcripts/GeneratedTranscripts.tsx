import React from "react";
import TranscriptEditWrapper from "./edits/TranscriptEditWrapper";
import type { Segment } from "sponsorblock-api";
import useVideoCaptions from "@/hooks/useVideoCaptions";
import useSegmentTranscript from "@/hooks/useSegmentTranscript";
import { trpc } from "@/utils/trpc";
import TranscriptVote from "./TranscriptVote";

const GeneratedTranscripts = ({
  segment,
  captionsURL,
  setTabValue,
  seekTo,
}: {
  segment: Segment;
  captionsURL: string;
  setTabValue?(v: string): void;
  seekTo(start: number, end: number): void;
}) => {
  const captions = useVideoCaptions({
    captionsURL: captionsURL,
  });
  const sponsorSegmentTranscripts = useSegmentTranscript({
    videoCaptions: captions.data,
    sponsorSegment: segment,
  });
  const savedTranscriptAnnotations = trpc.transcript.get.useQuery(
    {
      segmentUUID: segment.UUID,
      mode: "generated",
    },
    {
      enabled: !!segment.UUID,
    }
  );

  const TranscriptEditLoadWrapper = (
    <>
      {sponsorSegmentTranscripts.isLoading ? (
        <div className="h-32 w-full animate-pulse rounded-lg bg-th-additiveBackground bg-opacity-5"></div>
      ) : (
        sponsorSegmentTranscripts.data ? (
          <TranscriptEditWrapper
            key={`${segment.UUID}_default`}
            transcript={{
              segmentUUID: segment.UUID,
              text: sponsorSegmentTranscripts.data.transcript,
              startTime: sponsorSegmentTranscripts.data.transcriptStart,
              endTime: sponsorSegmentTranscripts.data.transcriptEnd,
              annotations:
                savedTranscriptAnnotations.data?.[0]?.TranscriptDetails?.[0]
                  ?.Annotations,
            }}
            setTabValue={setTabValue}
            seekTo={seekTo}
          />
        ) : <>missing transcript data</>
      )}
    </>
  );

  return (
    <div className="bg-blue-50 p-4">
      {savedTranscriptAnnotations.isLoading ? (
        <div className="h-32 w-full animate-pulse rounded-lg bg-th-additiveBackground bg-opacity-5"></div>
      ) : (
        <>
          {savedTranscriptAnnotations?.data?.[0]?.TranscriptDetails?.[0]
            ?.id && (
            <TranscriptVote
              transcriptDetailsId={
                savedTranscriptAnnotations?.data?.[0]?.TranscriptDetails?.[0]
                  ?.id
              }
              initialDirection={
                savedTranscriptAnnotations?.data?.[0]?.TranscriptDetails?.[0]
                  ?.Votes?.[0]?.direction ?? 0
              }
              transcriptId={savedTranscriptAnnotations?.data?.[0]?.id}
            />
          )}
          {TranscriptEditLoadWrapper}
        </>
      )}
    </div>
  );
};

export default GeneratedTranscripts;
