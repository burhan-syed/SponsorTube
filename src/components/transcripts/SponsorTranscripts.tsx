import React, { useMemo } from "react";
import useSponsorBlock from "../../hooks/useSponsorBlock";
import SegmentTranscript from "./SegmentTranscript";
import SegmentsGroupLoader from "../ui/loaders/transcripts/SegmentsGroupLoader";
import type { Segment } from "sponsorblock-api";

type SponsorTranscriptsProps = {
  videoID: string;
  captionTracks?: {
    url: string;
    languageCode: string;
  }[];
  seekTo(start: number, end: number): void;
  videoDuration?: number;
};

const SponsorTranscripts = ({
  videoID,
  captionTracks,
  seekTo,
  videoDuration,
}: SponsorTranscriptsProps) => {
  const { segments, savedSegments } = useSponsorBlock({ videoID });
  const engCaptions = useMemo(() => {
    let c = captionTracks?.filter(
      (t) => t.languageCode === "en" || t.languageCode === "en-US" || t.languageCode.includes("en-")
    );
    if ((c?.length ?? 0 > 0) && c?.some((c) => c.url.includes("kind=asr"))) {
      //prefer asr (automatic speech recognition) tracks as manual ones may exclude sponsored segments
      c = c?.filter((c) => c.url.includes("kind=asr"));
    }
    return c;
  }, [captionTracks]);

  // filter 0-0 second segments (whole video sponsors) or segments not in video time
  const filteredSavedSegments =
    savedSegments?.data?.filter(
      (segment) =>
        !(segment.startTime === 0 && segment.endTime === 0) &&
        (videoDuration ? segment.endTime <= videoDuration : true)
    ) ?? [];
  const filteredSegments =
    segments?.data?.filter(
      (segment) =>
        !(segment.startTime === 0 && segment.endTime === 0) &&
        (videoDuration ? segment.endTime <= videoDuration : true)
    ) ?? [];

  return (
    <>
      {savedSegments.isLoading || videoDuration === 0 ? (
        <>
          <SegmentsGroupLoader />
        </>
      ) : savedSegments.data && filteredSavedSegments.length > 0 ? (
        <>
          {filteredSavedSegments.map((segment) => (
            <SegmentTranscript
              key={segment.UUID}
              videoID={videoID}
              segment={segment as unknown as Segment}
              captionsURL={engCaptions?.[0]?.url ?? ""}
              seekTo={seekTo}
            />
          ))}
          {/* account for unsaved segments */}
          {filteredSegments
            ?.filter(
              (s) =>
                !savedSegments.data.find((p) => p.UUID === s.UUID) &&
                !(s.startTime === 0 && s.endTime === 0)
            )
            .map((segment) => (
              <SegmentTranscript
                key={segment.UUID}
                videoID={videoID}
                segment={segment}
                captionsURL={engCaptions?.[0]?.url ?? ""}
                seekTo={seekTo}
              />
            ))}
        </>
      ) : segments.data && filteredSegments.length > 0 ? (
        <>
          {filteredSegments.map((segment) => (
            <SegmentTranscript
              key={segment.UUID}
              videoID={videoID}
              segment={segment}
              captionsURL={engCaptions?.[0]?.url ?? ""}
              seekTo={seekTo}
            />
          ))}
        </>
      ) : (
        <div className="flex w-full flex-grow items-center justify-center rounded-lg border border-th-additiveBackground/10 bg-th-generalBackgroundA p-3 text-center text-sm leading-relaxed lg:leading-loose">
          <p>
            We found no sponsor segments for this video.
            <br />
            Submit any missing segments with{" "}
            <a
              className="text-th-callToAction hover:underline"
              href="https://sponsor.ajay.app/"
            >
              SponsorBlock
            </a>{" "}
            and check back later.
            <br />
            {(savedSegments.data?.length ?? 0 > filteredSavedSegments.length) ||
            (segments.data?.length ?? 0 > filteredSegments.length) ? (
              <>
                {"Some segments were hidden for invalid times. "}
                <br />
                View{" "}
                <a
                  className="text-th-callToAction hover:underline"
                  href={`https://sb.ltn.fi/video/${videoID}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  SponsorBlock DB
                </a>
              </>
            ) : (
              ""
            )}
          </p>
        </div>
      )}
      {/* {(savedSegments.data?.some(
        (segments) => segments.endTime === 0 && segments.startTime === 0
      ) ||
        segments.data?.some(
          (segments) => segments.startTime === 0 && segments.endTime === 0
        )) && (
        <div className="flex w-full items-center justify-center rounded-lg border border-th-additiveBackground/10 bg-th-generalBackgroundA p-3 text-center text-xs leading-relaxed lg:leading-loose">
          <p>
            Full video marked as sponsor.
            <br />
            View{" "}
            <a
              className="text-th-callToAction hover:underline"
              href={`https://sb.ltn.fi/video/${videoID}/`}
              target="_blank"
              rel="noreferrer"
            >
              SponsorBlock DB
            </a>
          </p>
        </div>
      )} */}
    </>
  );
};

export default SponsorTranscripts;
