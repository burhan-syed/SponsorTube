import React, { useEffect, useMemo, useState } from "react";
import useSponsorBlock from "../hooks/useSponsorBlock";
import useSponsorTranscripts from "../hooks/useSponsorTranscripts";
import useVideoCaptions from "../hooks/useVideoCaptions";

type SponsorTranscriptsProps = {
  videoID: string;
  captionTracks?: {
    base_url: string;
    language_code: string;
  }[];
};

// type TransformedSegmentTranscripts = {
//   UUID: string;
//   transcript: string;
//   runs: (string | null)[];
//   transcriptStart: number;
//   transcriptEnd: number;
// };

type TransformedSegmentTranscripts = {
  UUID: string;
  transcript: string;
  runs: (string | null)[];
  transcriptStart: number;
  transcriptEnd: number;
};

const SponsorTranscripts = ({
  videoID,
  captionTracks,
}: SponsorTranscriptsProps) => {
  const sponsors = useSponsorBlock({ videoID });
  const engCaptions = useMemo(
    () => captionTracks?.filter((t) => t.language_code === "en"),
    [captionTracks]
  );
  const captions = useVideoCaptions({
    captionsURL: engCaptions?.[0]?.base_url ?? "",
  });
  const sponsorSegmentTranscripts = useSponsorTranscripts({
    videoCaptions: captions.data,
    sponsorSegments: sponsors.data,
  });

  return (
    <div>
      {sponsors.isLoading ? (
        "sponsors loading.."
      ) : sponsors.data ? (
        <>
          {sponsors.data.length > 0 ? (
            <>
              {captions.isLoading ? (
                "captions loading.."
              ) : captions.data ? (
                <>
                  {sponsorSegmentTranscripts &&
                  Object.keys(sponsorSegmentTranscripts)?.length > 0 ? (
                    <div
                      className="flex flex-col gap-2"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {Object.values(sponsorSegmentTranscripts)?.map(
                        (segment) => (
                          <div className="rounded-3xl p-2" key={segment.UUID}>
                            <h3>{segment.UUID}</h3>
                            <p>{segment.runs.join("\n")}</p>
                            <span>
                              {segment.transcriptStart}:{segment.transcriptEnd}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    "segment transcripts loading.."
                  )}
                </>
              ) : (
                "captions error"
              )}
            </>
          ) : (
            "no sponsors"
          )}
        </>
      ) : (
        "sponsors error"
      )}
    </div>
  );
};

export default SponsorTranscripts;
