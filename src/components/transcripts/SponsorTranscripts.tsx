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
          {savedSegments.data.map((segment) => (
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
            ?.filter((s) => !savedSegments.data.find((p) => p.UUID === s.UUID))
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
          {segments.data.map((segment) => (
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
        <p className="w-full text-center text-sm font-semibold leading-relaxed lg:leading-loose">
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
      )}
    </>
  );
};

export default SponsorTranscripts;
