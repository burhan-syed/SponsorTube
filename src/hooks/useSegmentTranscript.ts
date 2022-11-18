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
    // [x: string]: {
    UUID: string;
    transcript: string;
    runs?: (string | null)[];
    transcriptStart: number;
    transcriptEnd: number;
    // };
  }>();

  useEffect(() => {
    if (videoCaptions && sponsorSegment) {
      setSponsorSegmentTranscripts(() => ({
        UUID: sponsorSegment.UUID,
        ...getTranscriptsInTime({
          transcripts: videoCaptions,
          times: {
            startTimeMS: sponsorSegment.startTime,
            endTimeMS: sponsorSegment.endTime,
          },
        }),
      }));
      // sponsorSegments.forEach((segment) => {
      //   (p) => {
      //     if (!p) {
      //       return {
      //         [segment.UUID]: {
      //           UUID: sponsorSegment.UUID,
      //           ...getTranscriptsInTime({
      //             transcripts: videoCaptions,
      //             times: {
      //               startTimeMS: sponsorSegment.startTime,
      //               endTimeMS: sponsorSegment.endTime,
      //             },
      //           }),
      //         // },
      //       };
      //     } else {
      //       return {
      //         ...p,
      //         [segment.UUID]: {
      //           UUID: sponsorSegment.UUID,
      //           ...getTranscriptsInTime({
      //             transcripts: videoCaptions,
      //             times: {
      //               startTimeMS: sponsorSegment.startTime,
      //               endTimeMS: sponsorSegment.endTime,
      //             },
      //           }),
      //         },
      //       };
      //     }
      //   }
      // );
      // });
    }
  }, [videoCaptions, sponsorSegment]);

  return sponsorSegmentTranscripts;
};

export default useSegmentTranscript;
