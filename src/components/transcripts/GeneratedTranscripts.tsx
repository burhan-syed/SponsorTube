import React, { useEffect, useState } from "react";
import TranscriptEditWrapper from "./edits/TranscriptEditWrapper";
import type { Segment } from "sponsorblock-api";
import useVideoCaptions from "@/hooks/useVideoCaptions";
import useSegmentTranscript from "@/hooks/useSegmentTranscript";
import { trpc } from "@/utils/trpc";
import Switch from "../ui/common/Switch";

const GeneratedTranscripts = ({
  segment,
  captionsURL,
  setTabValue,
  setIsNavDisabled,
  seekTo,
  isNavDisabled = false,
}: {
  segment: Segment;
  captionsURL: string;
  setTabValue?(v: string): void;
  setIsNavDisabled?(d: boolean): void;
  seekTo(start: number, end: number): void;
  isNavDisabled?: boolean;
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

  const [displayOriginal, setDisplayOriginal] = useState(false);

  return (
    <>
      {sponsorSegmentTranscripts.isLoading ||
      savedTranscriptAnnotations.isLoading ? (
        <div className="h-32 w-full animate-pulse rounded-lg bg-th-additiveBackground bg-opacity-5"></div>
      ) : sponsorSegmentTranscripts.data ? (
        <>
          {savedTranscriptAnnotations.data?.map(
            (savedTranscriptAnnotations) => (
              <>
                {sponsorSegmentTranscripts.data && (
                  <>
                    <TranscriptEditWrapper
                      key={`${segment.UUID}_${savedTranscriptAnnotations.id}`}
                      transcript={{
                        id: savedTranscriptAnnotations?.id,
                        transcriptDetailsId:
                          savedTranscriptAnnotations?.TranscriptDetails?.[0]
                            ?.id,
                        segmentUUID: segment.UUID,
                        text: displayOriginal
                          ? sponsorSegmentTranscripts.data.transcript
                          : savedTranscriptAnnotations?.text ??
                            sponsorSegmentTranscripts.data.transcript,
                        startTime:
                          sponsorSegmentTranscripts.data.transcriptStart,
                        endTime: sponsorSegmentTranscripts.data.transcriptEnd,
                        annotations: displayOriginal
                          ? undefined
                          : savedTranscriptAnnotations?.TranscriptDetails?.[0]
                              ?.Annotations,
                      }}
                      setTabValue={setTabValue}
                      setIsNavDisabled={setIsNavDisabled}
                      seekTo={seekTo}
                      initialVoteDirection={
                        savedTranscriptAnnotations?.TranscriptDetails?.[0]
                          ?.Votes?.[0]?.direction ?? 0
                      }
                    />
                    {savedTranscriptAnnotations.text &&
                      savedTranscriptAnnotations.text !==
                        sponsorSegmentTranscripts.data.transcript && (
                        <div className="flex items-center text-xs text-th-textSecondary">
                          <Switch
                            setOnCheckedChange={setDisplayOriginal}
                            checked={displayOriginal}
                            label="Display original transcript"
                            htmlFor={`display_original_switch_${segment.UUID}`}
                            disabled={isNavDisabled}
                          />
                        </div>
                      )}
                  </>
                )}
              </>
            )
          )}
        </>
      ) : (
        <>missing transcript data</>
      )}
    </>
  );
};

export default GeneratedTranscripts;

{
  /* <>
           <TranscriptEditWrapper
            key={`${segment.UUID}_default`}
            transcript={{
              id: savedTranscriptAnnotations.data?.[0]?.id,
              transcriptDetailsId:
                savedTranscriptAnnotations.data?.[0]?.TranscriptDetails?.[0]
                  ?.id,
              segmentUUID: segment.UUID,
              text: displayOriginal
                ? sponsorSegmentTranscripts.data.transcript
                : savedTranscriptAnnotations.data?.[0]?.text ??
                  sponsorSegmentTranscripts.data.transcript,
              startTime: sponsorSegmentTranscripts.data.transcriptStart,
              endTime: sponsorSegmentTranscripts.data.transcriptEnd,
              annotations: displayOriginal
                ? undefined
                : savedTranscriptAnnotations.data?.[0]?.TranscriptDetails?.[0]
                    ?.Annotations,
            }}
            setTabValue={setTabValue}
            setIsNavDisabled={setIsNavDisabled}
            seekTo={seekTo}
            initialVoteDirection={
              savedTranscriptAnnotations?.data?.[0]?.TranscriptDetails?.[0]
                ?.Votes?.[0]?.direction ?? 0
            }
          />
          {savedTranscriptAnnotations.data?.[0]?.text &&
            savedTranscriptAnnotations.data?.[0]?.text !==
              sponsorSegmentTranscripts.data.transcript && (
              <div className="flex items-center text-xs text-th-textSecondary">
                <Switch
                  setOnCheckedChange={setDisplayOriginal}
                  checked={displayOriginal}
                  label="Display original transcript"
                  htmlFor={`display_original_switch_${segment.UUID}`}
                  disabled={isNavDisabled}
                />
              </div>
            )}
        </> */
}
