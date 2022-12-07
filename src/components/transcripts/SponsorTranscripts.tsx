import React, { useMemo } from "react";
import useSponsorBlock from "../../hooks/useSponsorBlock";
import SegmentTranscript from "./SegmentTranscript";
import { Segment } from "sponsorblock-api";

type SponsorTranscriptsProps = {
  videoID: string;
  captionTracks?: {
    base_url: string;
    language_code: string;
  }[];
};

const SponsorTranscripts = ({
  videoID,
  captionTracks,
}: SponsorTranscriptsProps) => {
  const { segments, savedSegments } = useSponsorBlock({ videoID });
  const engCaptions = useMemo(
    () =>
      captionTracks?.filter(
        (t) => t.language_code === "en" || t.language_code === "en-US"
      ),
    [captionTracks]
  );
  //console.log("caption tracks?", captionTracks)
  //console.log("saved segments?", savedSegments.data, "sb segments?", segments.data);
  return (
    <div>
      {segments.isLoading ? (
        "sb segments loading.."
      ) : segments.data ? (
        <>{`sb segments: ${segments.data.length}`}</>
      ) : (
        "sponsors error"
      )}
      {savedSegments.isLoading ? (
        "saved segments loading.."
      ) : savedSegments.data ? (
        <>
          {savedSegments.data.length > 0 ? (
            <>
            {"saved segments"}
              {savedSegments.data.map((segment) => (
                <SegmentTranscript
                  key={segment.UUID}
                  segment={segment as unknown as Segment}
                  captionsURL={engCaptions?.[0]?.base_url ?? ""}
                />
              ))}
            </>
          ) : (
            <>
              {"no saved segments"}
              {segments.data && (
                <>
                  {segments.data.length > 0 ? (
                    <>
                      {segments.data.map((segment) => (
                        <SegmentTranscript
                          key={segment.UUID}
                          segment={segment}
                          captionsURL={engCaptions?.[0]?.base_url ?? ""}
                        />
                      ))}
                    </>
                  ) : (
                    "no sponsors"
                  )}
                </>
              )}
            </>
          )}
        </>
      ) : (
        "saved segments error"
      )}
    </div>
  );
};

export default SponsorTranscripts;
