import { Button } from "../ui/common/Button";
import { BiBrain } from "react-icons/bi";
import { trpc } from "@/utils/trpc";

const TranscriptAutoGen = ({
  setTabValue,
  setIsNavDisabled,
  transcript,
  editingToggled,
}: {
  setTabValue?(v: string): void;
  setIsNavDisabled?(d: boolean): void;
  editingToggled?: boolean;
  transcript: {
    segmentUUID: string;
    text: string;
    startTime?: number | null;
    endTime?: number | null;
  };
}) => {
  const utils = trpc.useContext();
  const getSegments = trpc.openai.getSegmentAnnotations.useMutation({
    async onSuccess() {
      await utils.transcript.get.invalidate({
        segmentUUID: transcript.segmentUUID,
      });
      setTabValue && setTabValue("generated");
    },
    async onError(error, variables, context) {
      console.log("error?", error, variables, context);
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
            segmentUUID: transcript.segmentUUID,
            transcript: transcript.text,
            endTime: transcript.endTime,
            startTime: transcript.startTime,
          })
        }
      >
        <BiBrain />
      </Button>
    </>
  );
};

export default TranscriptAutoGen;
