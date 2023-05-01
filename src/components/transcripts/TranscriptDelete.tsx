import React, { useState } from "react";

import { api } from "@/utils/api";
import { BiTrashAlt } from "react-icons/bi";
import { useSession } from "next-auth/react";
import AlertDialogueWrapper from "../ui/dialogue/AlertDialogWrapper";
import LoginAlertDialogueContent from "../ui/dialogue/LoginAlertDialogContent";
import ActionAlertDialogContent from "../ui/dialogue/ActionAlertDialogContent";
import { Button } from "../ui/common/Button";

interface TranscriptDeleteProps {
  segmentUUID: string;
  transcriptId?: string;
  transcriptDetailsId?: string;
}

const TranscriptDelete = ({
  segmentUUID,
  transcriptId,
  transcriptDetailsId,
}: TranscriptDeleteProps) => {
  const { data: sessionData } = useSession();

  const utils = api.useContext();
  const deleteTranscript = api.transcript.delete.useMutation({
    onSuccess() {
      utils.transcript.get.invalidate({ segmentUUID });
    },
  });
  const mutate = () =>
    deleteTranscript.mutate({ transcriptDetailsId, transcriptId });
  const [triggerLoginAlertDialogue, setTriggerLoginAlertDialogue] = useState(0);
  const [triggerDeleteAlertDialogue, setTriggerDeleteAlertDialogue] =
    useState(0);
  const deleteButton = (
    <Button
      round
      disabled={
        deleteTranscript.isLoading || (!transcriptId && !transcriptDetailsId)
      }
      onClick={() => {
        !sessionData
          ? setTriggerLoginAlertDialogue((a) => a + 1)
          : setTriggerDeleteAlertDialogue((a) => a + 1);
      }}
    >
      <BiTrashAlt />
    </Button>
  );
  if (!sessionData) {
    return (
      <>
        <AlertDialogueWrapper
          triggerAlert={triggerLoginAlertDialogue}
          content={
            <>
              <LoginAlertDialogueContent description="login to delete" />
            </>
          }
        >
          <>{deleteButton}</>
        </AlertDialogueWrapper>
      </>
    );
  }
  return (
    <>
      <AlertDialogueWrapper
        triggerAlert={triggerDeleteAlertDialogue}
        content={
          <>
            <ActionAlertDialogContent
              action={mutate}
              description="are you sure you want to delete?"
            />
          </>
        }
      >
        <>{deleteButton}</>
      </AlertDialogueWrapper>
    </>
  );
};

export default TranscriptDelete;
