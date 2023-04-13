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
};

const SponsorTranscripts = ({
  videoID,
  captionTracks,
  seekTo,
}: SponsorTranscriptsProps) => {
  const { segments, savedSegments } = useSponsorBlock({ videoID });
  const engCaptions = useMemo(
    () =>
      captionTracks?.filter(
        (t) => t.languageCode === "en" || t.languageCode === "en-US"
      ),
    [captionTracks]
  );
  return (
    <>
      {savedSegments.isLoading ? (
        <>
          <SegmentsGroupLoader />
        </>
      ) : savedSegments.data && savedSegments?.data?.length > 0 ? (
        <>
          {savedSegments.data
            // filter 0-0 second segments (whole video sponsors)
            .filter(
              (segment) => !(segment.startTime === 0 && segment.endTime === 0)
            )
            .map((segment) => (
              <SegmentTranscript
                key={segment.UUID}
                videoID={videoID}
                segment={segment as unknown as Segment}
                captionsURL={engCaptions?.[0]?.url ?? ""}
                seekTo={seekTo}
              />
            ))}
          {/* account for unsaved segments */}
          {segments.data
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
      ) : segments.data && segments.data.length > 0 ? (
        <>
          {segments.data
            .filter(
              (segment) => !(segment.startTime === 0 && segment.endTime === 0)
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
      ) : (
        <div className="flex w-full flex-grow items-center justify-center rounded-lg border border-th-additiveBackground/10 bg-th-generalBackgroundA p-3 text-center text-sm font-semibold leading-relaxed lg:leading-loose">
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
