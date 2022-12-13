import { trpc } from "@/utils/trpc";
import React from "react";
import { BiUpArrow, BiDownArrow } from "react-icons/bi";
const TranscriptVote = ({
  transcriptDetailsId,
  transcriptId,
  initialDirection,
}: {
  transcriptDetailsId: string;
  transcriptId: string;
  initialDirection: number;
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
      {votes?.data?.direction}
      <button
        disabled={!transcriptDetailsId || votes.isLoading || votes.isError || vote.isLoading}
        onClick={() =>
          vote.mutate({
            transcriptDetailsId: transcriptDetailsId,
            previous: votes?.data?.direction ?? 0,
            direction: votes?.data?.direction === 1 ? 0 : 1,
            transcriptId: transcriptId,
          })
        }
      >
        <BiUpArrow />
      </button>
      <button
        disabled={!transcriptDetailsId || votes.isLoading || votes.isError || vote.isLoading}
        onClick={() =>
          vote.mutate({
            transcriptDetailsId: transcriptDetailsId,
            previous: votes?.data?.direction ?? 0,
            direction: votes?.data?.direction === -1 ? 0 : -1,
            transcriptId: transcriptId,
          })
        }
      >
        <BiDownArrow />
      </button>
    </>
  );
};

export default TranscriptVote;
