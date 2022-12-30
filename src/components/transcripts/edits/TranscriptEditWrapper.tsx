import React, { useState } from "react";

import Toggle from "../../ui/common/Toggle";
import { MdAdd, MdEditNote } from "react-icons/md";
import type { TranscriptAnnotations } from "@prisma/client";
import TranscriptAnnotator from "./TranscriptAnnotator";
import Tooltip from "../../ui/common/Tooltip";
import TranscriptEditor from "./TranscriptEditor";
import clsx from "clsx";
import { trpc } from "@/utils/trpc";

type Transcript = {
  segmentUUID: string;
  text: string;
  annotations?: TranscriptAnnotations[];
  id?: string;
  transcriptDetailsId?: string;
  startTime?: number | null;
  endTime?: number | null;
};
interface TranscriptEditWrapperProps {
  transcript: Transcript;
  setTabValue?(v: string): void;
}

const TranscriptEditWrapper = ({
  transcript,
  setTabValue,
}: TranscriptEditWrapperProps) => {
  const [editToggled, setEditToggled] = useState(false);
  const [annotateToggled, setAnnotateToggled] = useState(false);

  const utils = trpc.useContext();
  const getSegments = trpc.openai.getSegmentAnnotations.useMutation({
    async onSuccess() {
      await utils.transcript.get.invalidate({
        segmentUUID: transcript.segmentUUID,
      });
      setTabValue && setTabValue("generated");
    },
  });

  return (
    <div>
      <div className="flex items-center">
        <button
          onClick={() =>
            getSegments.mutate({
              segmentUUID: transcript.segmentUUID,
              transcript: transcript.text,
              endTime: transcript.endTime,
              startTime: transcript.startTime,
            })
          }
        >
          test
        </button>
        <Tooltip text="annotate">
          <Toggle
            pressed={annotateToggled}
            onPressedChange={(p) => setAnnotateToggled(p)}
          >
            <MdAdd />
          </Toggle>
        </Tooltip>
        <Tooltip text="edit">
          <Toggle
            pressed={editToggled}
            onPressedChange={(p) => setEditToggled(p)}
          >
            <MdEditNote />
          </Toggle>
        </Tooltip>
      </div>
      <div>
        <TranscriptAnnotator
          transcript={{
            segmentUUID: transcript.segmentUUID,
            text: transcript.text,
            annotations: transcript.annotations,
            id: transcript.id,
            transcriptDetailsId: transcript.transcriptDetailsId,
            startTime: transcript.startTime,
            endTime: transcript.endTime,
          }}
          editable={annotateToggled}
          setEditable={setAnnotateToggled}
          setTabValue={setTabValue}
        />
      </div>

      <div className={clsx(editToggled ? "block" : "hidden")}>
        <TranscriptEditor
          text={transcript.text}
          segmentUUID={transcript.segmentUUID}
          startTime={transcript.startTime}
          endTime={transcript.endTime}
          setOpen={(o: boolean) => setEditToggled(o)}
          setTabValue={setTabValue}
        />
      </div>
    </div>
  );
};

export default TranscriptEditWrapper;
