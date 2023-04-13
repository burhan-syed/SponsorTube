import { useState, useEffect } from "react";
import { getTranscriptsInTime } from "../server/functions/transcripts";
import type { Segment } from "sponsorblock-api";

const useSegmentTranscript = ({
  videoCaptions,
  sponsorSegment,
}: {
  videoCaptions?: {
    start: number;
    dur: number;
    text: string | null;
  }[];
  sponsorSegment?: Segment;
}) => {
  const [sponsorSegmentTranscripts, setSponsorSegmentTranscripts] = useState<{
    isLoading: boolean;
    isError: boolean;
    data?: {
      UUID: string;
      transcript: string;
      runs?: (string | null)[];
      transcriptStart: number;
      transcriptEnd: number;
    };
  }>({ isLoading: true, isError: false });

  useEffect(() => {
    if (videoCaptions && sponsorSegment) {
      setSponsorSegmentTranscripts(() => ({
        isLoading: false,
        isError: false,
        data: {
          UUID: sponsorSegment.UUID,
          ...getTranscriptsInTime({
            transcripts: videoCaptions,
            times: {
              startTimeMS: sponsorSegment.startTime,
              endTimeMS: sponsorSegment.endTime,
            },
          }),
        },
      }));
    }
  }, [videoCaptions, sponsorSegment]);

  return sponsorSegmentTranscripts;
};

export default useSegmentTranscript;
