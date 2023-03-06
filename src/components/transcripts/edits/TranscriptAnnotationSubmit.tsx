import { Button } from "@/components/ui/common/Button";
import useGlobalStore from "@/store/useGlobalStore";
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
  const dialogueTrigger = useGlobalStore((store) => store.setDialogueTrigger);
  const utils = trpc.useContext();
  const submitAnnotations = trpc.transcript.saveAnnotations.useMutation({
    async onSuccess() {
      await Promise.all([
        utils.transcript.get.invalidate({
          segmentUUID: segment.UUID,
        }),
        transcript?.annotations?.[0]?.transcriptDetailsId &&
          utils.transcript.getMyVote.invalidate({
            transcriptDetailsId:
              transcript?.annotations?.[0]?.transcriptDetailsId,
          }),
        utils.video.getSponsors.invalidate({
          videoId: videoID,
        }),
      ]);
      setEditable(false);
      setTabValue && setTabValue("user");
    },
    onError(error, variables, context) {
      transcript?.annotations?.[0]?.transcriptDetailsId &&
        utils.transcript.getMyVote.invalidate({
          transcriptDetailsId:
            transcript?.annotations?.[0]?.transcriptDetailsId,
        });

      dialogueTrigger({
        title: "Failed to save annotations",
        description: error.message,
        close: "ok",
      });
    },
  });

  return (
    <>
      <Button
        disabled={!editable || submitAnnotations.isLoading}
        onClick={() => {
          setEditable(false);
        }}
      >
        Cancel
      </Button>
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
