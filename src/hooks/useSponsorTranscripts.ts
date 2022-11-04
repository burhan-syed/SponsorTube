import { useState, useEffect } from "react";
import { getTranscriptsInTime } from "../server/functions/captions";
import type { Segment } from "sponsorblock-api";

const useSponsorTranscripts = ({
  videoCaptions,
  sponsorSegments,
}: {
  videoCaptions?: {
    start: number;
    duration: number;
    text: string | null;
  }[];
  sponsorSegments?: Segment[];
}) => {
  const [sponsorSegmentTranscripts, setSponsorSegmentTranscripts] = useState<{
    [x: string]: {
      UUID: string;
      transcript: string;
      runs: (string | null)[];
      transcriptStart: number;
      transcriptEnd: number;
    };
  }>();

  useEffect(() => {
    if (videoCaptions && sponsorSegments) {
      sponsorSegments.forEach((segment) => {
        setSponsorSegmentTranscripts(
          (p) => {
            if (!p) {
              return {
                [segment.UUID]: {
                  UUID: segment.UUID,
                  ...getTranscriptsInTime({
                    transcripts: videoCaptions,
                    times: {
                      startTimeMS: segment.startTime,
                      endTimeMS: segment.endTime,
                    },
                  }),
                },
              };
            } else {
              return {
                ...p,
                [segment.UUID]: {
                  UUID: segment.UUID,
                  ...getTranscriptsInTime({
                    transcripts: videoCaptions,
                    times: {
                      startTimeMS: segment.startTime,
                      endTimeMS: segment.endTime,
                    },
                  }),
                },
              };
            }
          }
        );
      });
    }
  }, [videoCaptions, sponsorSegments]);

  return sponsorSegmentTranscripts;
};

export default useSponsorTranscripts;
