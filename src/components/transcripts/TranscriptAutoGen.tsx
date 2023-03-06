import { Button } from "../ui/common/Button";
import { BiBrain } from "react-icons/bi";
import { trpc } from "@/utils/trpc";
import { Segment } from "sponsorblock-api";

const TranscriptAutoGen = ({
  setTabValue,
  segment,
  setIsNavDisabled,
  transcript,
  editingToggled,
  videoID,
}: {
  setTabValue?(v: string): void;
  setIsNavDisabled?(d: boolean): void;
  editingToggled?: boolean;
  segment: Segment;
  transcript: {
    text: string;
    startTime?: number | null;
    endTime?: number | null;
  };
  videoID: string;
}) => {
  const utils = trpc.useContext();

  const getSegments = trpc.openai.getSegmentAnnotations.useMutation({
    async onSuccess() {
      await Promise.all([
        utils.transcript.get.invalidate({
          segmentUUID: segment.UUID,
        }),
        utils.video.getSponsors.invalidate({
          videoId: videoID,
        }),
      ]);
      setTabValue && setTabValue("generated");
    },
    async onError(error, variables, context) {
      console.log("error?", error, variables, context);
      if (error.data?.code === "CONFLICT") {
        await utils.transcript.get.invalidate({
          segmentUUID: segment.UUID,
        });
        setTabValue && setTabValue("generated");
      }
    },
  });

  return (
    <>
      <Button
        round
        disabled={editingToggled || getSegments.isLoading}
        loading={getSegments.isLoading}
        onClick={() =>
          getSegments.mutate({
            segment: segment,
            transcript: transcript.text,
            endTime: transcript.endTime,
            startTime: transcript.startTime,
            videoId: videoID,
          })
        }
      >
        <BiBrain />
      </Button>
    </>
  );
};

export default TranscriptAutoGen;
