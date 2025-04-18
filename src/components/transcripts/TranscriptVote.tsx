import { api } from "@/utils/api";
import {
  RiThumbUpLine,
  RiThumbUpFill,
  RiThumbDownLine,
  RiThumbDownFill,
} from "react-icons/ri";

import { Button } from "../ui/common/Button";
const TranscriptVote = ({
  videoId,
  segmentUUID,
  transcriptDetailsId,
  transcriptId,
  initialDirection,
  disabled = false,
}: {
  videoId: string;
  segmentUUID: string;
  transcriptDetailsId: string;
  transcriptId: string;
  initialDirection?: number;
  disabled?: boolean;
}) => {
  const utils = api.useContext();
  const votes = api.transcript.getMyVote.useQuery(
    {
      transcriptDetailsId: transcriptDetailsId,
    },
    {
      enabled: !!transcriptDetailsId,
      initialData: { direction: initialDirection },
    }
  );
  const vote = api.transcript.voteTranscriptDetails.useMutation({
    onMutate(variables) {
      utils.transcript.getMyVote.setData(
        { transcriptDetailsId: variables.transcriptDetailsId },
        () => ({ direction: variables.direction })
      );
    },
    async onSuccess(data) {
      if (data.revalidate) {
        await utils.video.getSponsors.invalidate({
          videoId: videoId,
        });
      }
    },
  });

  return (
    <>
      <Button
        round
        disableFade
        requireSession={{ required: true, reason: "login to vote" }}
        disabled={
          disabled ||
          !transcriptDetailsId ||
          votes.isLoading ||
          votes.isError ||
          vote.isLoading
        }
        onClick={() =>
          vote.mutate({
            transcriptDetailsId: transcriptDetailsId,
            previous: votes?.data?.direction ?? 0,
            direction: votes?.data?.direction === 1 ? 0 : 1,
            transcriptId: transcriptId,
            videoId,
            segmentUUID,
          })
        }
      >
        {votes?.data?.direction === 1 ? <RiThumbUpFill /> : <RiThumbUpLine />}
      </Button>
      <Button
        round
        disableFade
        requireSession={{ required: true, reason: "login to vote" }}
        disabled={
          disabled ||
          !transcriptDetailsId ||
          votes.isLoading ||
          votes.isError ||
          vote.isLoading
        }
        onClick={() =>
          vote.mutate({
            transcriptDetailsId: transcriptDetailsId,
            previous: votes?.data?.direction ?? 0,
            direction: votes?.data?.direction === -1 ? 0 : -1,
            transcriptId: transcriptId,
            videoId,
            segmentUUID,
          })
        }
      >
        {votes?.data?.direction === -1 ? (
          <RiThumbDownFill />
        ) : (
          <RiThumbDownLine />
        )}
      </Button>
    </>
  );
};

export default TranscriptVote;
