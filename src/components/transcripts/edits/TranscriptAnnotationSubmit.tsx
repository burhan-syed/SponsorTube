import { Button } from "@/components/ui/common/Button";
import { trpc } from "@/utils/trpc";
import type { TranscriptAnnotations } from "@prisma/client";
import React from "react";
import { Segment } from "sponsorblock-api";

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

const TranscriptAnnotationSubmit = ({
  videoID,
  segment,
  transcript,
  annotations,
  editable,
  areSegmentsSame,
  setEditable,
  setTabValue,
}: {
  videoID: string;
  segment: Segment;
  editable: boolean;
  areSegmentsSame: boolean;
  transcript: {
    text: string;
    id?: string;
    annotations?: TranscriptAnnotations[];
    transcriptDetailsId?: string;
    startTime?: number | null;
    endTime?: number | null;
  };
  annotations: AtLeast<
    TranscriptAnnotations,
    "start" | "end" | "text" | "tag"
  >[];
  setEditable(b: boolean): void;
  setTabValue?(v: string): void;
}) => {
  const utils = trpc.useContext();
  const submitAnnotations = trpc.transcript.saveAnnotations.useMutation({
    async onSuccess() {
      const transcriptInvalidate = utils.transcript.get.invalidate({
        segmentUUID: segment.UUID,
      });
      if (transcript?.annotations?.[0]?.transcriptDetailsId) {
        utils.transcript.getMyVote.invalidate({
          transcriptDetailsId:
            transcript?.annotations?.[0]?.transcriptDetailsId,
        });
      }
      await transcriptInvalidate;
      setEditable(false);
      setTabValue && setTabValue("user");
    },
  });

  return (
    <>
      <Button
        variant={"accent"}
        requireSession={{
          required: true,
          reason: "Please login to submit transcript annotations!",
        }}
        disabled={
          !editable ||
          submitAnnotations.isLoading ||
          areSegmentsSame ||
          !(annotations.length > 0)
        }
        loading={submitAnnotations.isLoading}
        onClick={() => {
          submitAnnotations.mutate({
            segment,
            transcriptId: transcript.id,
            startTime: transcript.startTime,
            endTime: transcript.endTime,
            transcript: transcript.text,
            transcriptDetailsId: transcript.transcriptDetailsId,
            annotations,
            videoId: videoID,
          });
        }}
      >
        Submit
      </Button>
    </>
  );
};

export default TranscriptAnnotationSubmit;
