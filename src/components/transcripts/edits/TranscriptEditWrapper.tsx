import React, { useState } from "react";

import Toggle from "../../ui/common/Toggle";
import { MdAdd, MdEditNote } from "react-icons/md";
import type { TranscriptAnnotations } from "@prisma/client";
import TranscriptAnnotator from "./TranscriptAnnotator";
import Tooltip from "../../ui/common/Tooltip";
import TranscriptEditor from "./TranscriptEditor";
import clsx from "clsx";

type Transcript = {
  segmentUUID: string;
  text: string;
  annotations?: TranscriptAnnotations[];
  id?: string;
  transcriptDetailsId?: string;
  startTime?: number|null;
  endTime?: number|null;
};
interface TranscriptEditWrapperProps {
  transcript: Transcript;
}

const TranscriptEditWrapper = ({ transcript }: TranscriptEditWrapperProps) => {
  const [editToggled, setEditToggled] = useState(false);
  const [annotateToggled, setAnnotateToggled] = useState(false);
  return (
    <div>
      <div className="flex items-center">
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
        />
      </div>

      <div className={clsx(editToggled ? "block" : "hidden")}>
        <TranscriptEditor
          text={transcript.text}
          segmentUUID={transcript.segmentUUID}
          startTime={transcript.startTime}
          endTime={transcript.endTime}
          setOpen={(o: boolean) => setEditToggled(o)}
        />
      </div>
    </div>
  );
};

export default TranscriptEditWrapper;
