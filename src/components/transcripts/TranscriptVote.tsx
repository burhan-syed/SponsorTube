import { trpc } from "@/utils/trpc";
import {
  RiThumbUpLine,
  RiThumbUpFill,
  RiThumbDownLine,
  RiThumbDownFill,
} from "react-icons/ri";

import { Button } from "../ui/common/Button";
const TranscriptVote = ({
  transcriptDetailsId,
  transcriptId,
  initialDirection,
  disabled = false,
}: {
  transcriptDetailsId: string;
  transcriptId: string;
  initialDirection: number;
  disabled?: boolean;
}) => {
  const utils = trpc.useContext();
  const votes = trpc.transcript.getMyVote.useQuery(
    {
      transcriptDetailsId: transcriptDetailsId,
    },
    {
      enabled: !!transcriptDetailsId,
      initialData: { direction: initialDirection },
    }
  );
  const vote = trpc.transcript.voteTranscriptDetails.useMutation({
    onMutate(variables) {
      utils.transcript.getMyVote.setData(
        { transcriptDetailsId: variables.transcriptDetailsId },
        () => ({ direction: variables.direction })
      );
    },
  });

  console.log("vote?", transcriptDetailsId, votes.data);

  return (
    <>
      <Button
        round
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
          })
        }
      >
        {votes?.data?.direction === 1 ? <RiThumbUpFill /> : <RiThumbUpLine />}
      </Button>
      <Button
        round
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
