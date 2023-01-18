import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import {
  RiThumbUpLine,
  RiThumbUpFill,
  RiThumbDownLine,
  RiThumbDownFill,
} from "react-icons/ri";
import AlertDialogueWrapper from "../ui/dialogue/AlertDialogueWrapper";
import LoginAlertDialogueContent from "../ui/dialogue/LoginAlertDialogueContent";
import { Button } from "../ui/common/Button";
const TranscriptVote = ({
  transcriptDetailsId,
  transcriptId,
  initialDirection,
}: {
  transcriptDetailsId: string;
  transcriptId: string;
  initialDirection: number;
}) => {
  const { data: sessionData } = useSession();
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
  const [triggerAlertDialogue, setTriggerAlertDialogue] = useState(0);

  const voteButtons = (
    <>
      <Button
        round
        disabled={
          !transcriptDetailsId ||
          votes.isLoading ||
          votes.isError ||
          vote.isLoading
        }
        onClick={() =>
          !sessionData
            ? setTriggerAlertDialogue((a) => a + 1)
            : vote.mutate({
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
        disabled={
          !transcriptDetailsId ||
          votes.isLoading ||
          votes.isError ||
          vote.isLoading
        }
        onClick={() =>
          !sessionData
            ? setTriggerAlertDialogue((a) => a + 1)
            : vote.mutate({
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

  if (!sessionData) {
    return (
      <>
        <AlertDialogueWrapper
          triggerAlert={triggerAlertDialogue}
          content={
            <>
              <LoginAlertDialogueContent description="login to vote" />
            </>
          }
        >
          <>{voteButtons}</>
        </AlertDialogueWrapper>
      </>
    );
  }
  return <>{voteButtons}</>;
};

export default TranscriptVote;
