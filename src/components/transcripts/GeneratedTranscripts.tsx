import React, { useEffect, useState } from "react";
import TranscriptEditWrapper from "./edits/TranscriptEditWrapper";
import type { Segment } from "sponsorblock-api";
import useVideoCaptions from "@/hooks/useVideoCaptions";
import useSegmentTranscript from "@/hooks/useSegmentTranscript";
import { api } from "@/utils/api";
import Switch from "../ui/common/Switch";
import TranscriptLoader from "../ui/loaders/transcripts/TranscriptLoader";

const GeneratedTranscripts = ({
  segment,
  videoID,
  captionsURL,
  setTabValue,
  setIsNavDisabled,
  seekTo,
  isNavDisabled = false,
}: {
  segment: Segment;
  videoID: string;
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
  const savedTranscriptAnnotations = api.transcript.get.useQuery(
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
        <TranscriptLoader />
      ) : (savedTranscriptAnnotations?.data?.length ?? 0) > 0 &&
        sponsorSegmentTranscripts.data ? (
        <>
          {savedTranscriptAnnotations.data?.map(
            (savedTranscriptAnnotations) => (
              <>
                {sponsorSegmentTranscripts.data && ( //appeasing TS
                  <>
                    <TranscriptEditWrapper
                      key={`${segment.UUID}_${savedTranscriptAnnotations.id}`}
                      segment={segment}
                      videoID={videoID}
                      transcript={{
                        id: savedTranscriptAnnotations?.id,
                        transcriptDetailsId:
                          savedTranscriptAnnotations?.TranscriptDetails?.[0]
                            ?.id,
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
      ) : sponsorSegmentTranscripts.data?.transcript ? (
        <>
          <TranscriptEditWrapper
            key={`${segment.UUID}_default`}
            segment={segment}
            videoID={videoID}
            transcript={{
              text: sponsorSegmentTranscripts.data.transcript,
              startTime: sponsorSegmentTranscripts.data.transcriptStart,
              endTime: sponsorSegmentTranscripts.data.transcriptEnd,
              annotations: undefined,
            }}
            setTabValue={setTabValue}
            setIsNavDisabled={setIsNavDisabled}
            seekTo={seekTo}
          />
        </>
      ) : (
        <>missing transcript data</>
      )}
    </>
  );
};

export default GeneratedTranscripts;
