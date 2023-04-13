import React, { useEffect, useState } from "react";
import TranscriptEditWrapper from "./edits/TranscriptEditWrapper";
import type { Segment } from "sponsorblock-api";
import useVideoCaptions from "@/hooks/useVideoCaptions";
import useSegmentTranscript from "@/hooks/useSegmentTranscript";
import { api } from "@/utils/api";
import Switch from "../ui/common/Switch";
import TranscriptLoader from "../ui/loaders/transcripts/TranscriptLoader";
import TranscriptTopBar from "./TranscriptTopBar";

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
      {!captions.isError &&
      (sponsorSegmentTranscripts.isLoading ||
        savedTranscriptAnnotations.isLoading) ? (
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

                    <div className="flex flex-wrap items-center justify-between gap-x-2 rounded-b-lg bg-th-baseBackground px-2 text-xs text-th-textSecondary">
                      {savedTranscriptAnnotations?.TranscriptDetails?.[0]
                        ?.Annotations?.length ?? 0 > 0 ? (
                        <span>
                          These annotations were automatically applied
                        </span>
                      ) : (
                        <span>This transcript was automatically generated</span>
                      )}
                      {savedTranscriptAnnotations.text !==
                        sponsorSegmentTranscripts.data.transcript && (
                        <div className="flex items-center">
                          <span className="mr-2">
                            This transcript was modified{" "}
                          </span>
                          <Switch
                            setOnCheckedChange={setDisplayOriginal}
                            checked={displayOriginal}
                            label="Display original"
                            htmlFor={`display_original_switch_${segment.UUID}`}
                            disabled={isNavDisabled}
                          />
                        </div>
                      )}
                    </div>
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
          <div className="flex flex-wrap items-center justify-between gap-x-2 rounded-b-lg bg-th-baseBackground px-2 text-xs text-th-textSecondary">
            <span>This transcript was automatically generated</span>
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
          <p className="flex h-full w-full flex-grow items-center justify-center p-2">
            <span>
              {segment.UUID && segment.startTime === 0 && segment.endTime === 0
                ? "Full video is sponsored"
                : "missing transcript data"}

              <br />
              {!captionsURL && (
                <>
                  no english captions found <br />
                </>
              )}
              <span className="text-th-textSecondary">video {videoID}</span>
              <br />
              <a
                href={`https://sb.ltn.fi/uuid/${segment.UUID}`}
                target="_blank"
                rel="noreferrer"
                className="break-all text-th-textSecondary hover:underline"
              >
                segment {segment.UUID}
              </a>
              <br />
              {captionsURL && (
                <a
                  href={captionsURL}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-th-textSecondary hover:underline"
                >
                  captions link
                </a>
              )}
            </span>
          </p>
        </div>
      )}
    </>
  );
};

export default GeneratedTranscripts;
