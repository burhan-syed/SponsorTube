import React, { useMemo } from "react";
import useSponsorBlock from "../../hooks/useSponsorBlock";
import SegmentTranscript from "./SegmentTranscript";
import SegmentsGroupLoader from "../ui/loaders/SegmentsGroupLoader";
import type { Segment } from "sponsorblock-api";

type SponsorTranscriptsProps = {
  videoID: string;
  captionTracks?: {
    base_url: string;
    language_code: string;
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
        (t) => t.language_code === "en" || t.language_code === "en-US"
      ),
    [captionTracks]
  );
  return (
    <>
      {savedSegments.isLoading ? (
        <>
          <SegmentsGroupLoader />
        </>
      ) : savedSegments.data ? (
        <>
          {savedSegments.data.length > 0 ? (
            <>
              {savedSegments.data.map((segment) => (
                <SegmentTranscript
                  key={segment.UUID}
                  videoID={videoID}
                  segment={segment as unknown as Segment}
                  captionsURL={engCaptions?.[0]?.base_url ?? ""}
                  seekTo={seekTo}
                />
              ))}
            </>
          ) : (
            <>
              {segments.isLoading ? (
                <SegmentsGroupLoader />
              ) : segments.data ? (
                <>
                  {segments.data.length > 0 ? (
                    <>
                      {segments.data.map((segment) => (
                        <SegmentTranscript
                          key={segment.UUID}
                          videoID={videoID}
                          segment={segment}
                          captionsURL={engCaptions?.[0]?.base_url ?? ""}
                          seekTo={seekTo}
                        />
                      ))}
                    </>
                  ) : (
                    "no sponsors"
                  )}
                </>
              ) : (
                "sponsors error"
              )}
            </>
          )}
        </>
      ) : (
        "saved segments error"
      )}
    </>
  );
};

export default SponsorTranscripts;
