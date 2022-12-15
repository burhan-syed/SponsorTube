import React, { useState } from "react";

import { trpc } from "@/utils/trpc";
import { BiTrashAlt } from "react-icons/bi";
import { useSession } from "next-auth/react";
import AlertDialogueWrapper from "../ui/dialogue/AlertDialogueWrapper";
import LoginAlertDialogueContent from "../ui/dialogue/LoginAlertDialogueContent";
import ActionAlertDialogueContent from "../ui/dialogue/ActionAlertDialogueContent";

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

  const utils = trpc.useContext();
  const deleteTranscript = trpc.transcript.delete.useMutation({
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
    <button
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
    </button>
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
            <ActionAlertDialogueContent
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
