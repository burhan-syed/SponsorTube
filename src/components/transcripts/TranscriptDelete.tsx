import React from "react";

import { trpc } from "@/utils/trpc";
import { BiTrashAlt } from "react-icons/bi";

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
  const utils = trpc.useContext();
  const deleteTranscript = trpc.transcript.delete.useMutation({
    onSuccess() {
      utils.transcript.get.invalidate({ segmentUUID });
    },
  });
  return (
    <button
      disabled={
        deleteTranscript.isLoading || (!transcriptId && !transcriptDetailsId)
      }
      onClick={() =>
        deleteTranscript.mutate({ transcriptDetailsId, transcriptId })
      }
    >
      <BiTrashAlt />
    </button>
  );
};

export default TranscriptDelete;
