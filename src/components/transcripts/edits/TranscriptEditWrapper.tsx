import React, { useState } from "react";

import Toggle from "../../ui/common/Toggle";
import { MdEditNote } from "react-icons/md";
import { BsInputCursorText, BsPlay } from "react-icons/bs";
import { BiBrain } from "react-icons/bi";
import type { AnnotationTags, TranscriptAnnotations } from "@prisma/client";
import TranscriptAnnotator from "./TranscriptAnnotator";
import Tooltip from "../../ui/common/Tooltip";
import TranscriptEditor from "./TranscriptEditor";
import clsx from "clsx";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/common/Button";
import Selector from "@/components/ui/common/Selector";

import TAGS from "./TranscriptTagColors";
import TranscriptVote from "../TranscriptVote";

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
  initialVoteDirection: number;
  seekTo(start: number, end: number): void;
  setTabValue?(v: string): void;
}

const TranscriptEditWrapper = ({
  transcript,
  setTabValue,
  seekTo,
  initialVoteDirection,
}: TranscriptEditWrapperProps) => {
  const [editToggled, setEditToggled] = useState(false);
  const [annotateToggled, setAnnotateToggled] = useState(false);
  const [tag, setTag] = React.useState<AnnotationTags>("BRAND");

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
    <div className="flex flex-grow flex-col justify-between outline outline-green-300">
      <div
        className="flex items-start justify-start gap-2 border sm:translate-x-0 sm:flex-row"
        //-translate-x-1/2
      >
        {transcript.id && transcript.transcriptDetailsId && (
          <TranscriptVote
            initialDirection={initialVoteDirection}
            transcriptDetailsId={transcript.transcriptDetailsId}
            transcriptId={transcript.id}
          />
        )}

      
        <div className="mx-auto"></div>
        {annotateToggled && (
          // <div
          //   //comments for rotated version
          //   className="relative  sm:h-auto" //h-32
          // >
          <div
            className="h-9 w-32"
            //pointer-events-none absolute  top-0 h-9 w-32 origin-top-left rotate-[270deg] sm:pointer-events-auto sm:block sm:rotate-0
          >
            {/* <div className="pointer-events-auto h-full w-full -translate-x-full sm:translate-x-0 "> */}
            <Selector
              selectItems={Array.from(TAGS.keys()).map((t) => ({
                value: t,
              }))}
              valuePlaceholder="select.."
              initialValueIndex={0}
              handler={(v: AnnotationTags) => setTag(v)}
            />
            {/* </div> */}
          </div>
          // </div>
        )}
        <div className={clsx(annotateToggled && "hidden")}>
          <Tooltip text="edit text">
            <Toggle
              pressed={editToggled}
              onPressedChange={(p) => setEditToggled(p)}
            >
              <BsInputCursorText />
            </Toggle>
          </Tooltip>
        </div>
        <Tooltip text="annotate">
          <Toggle
            pressed={annotateToggled}
            onPressedChange={(p) => setAnnotateToggled(p)}
          >
            <MdEditNote />
          </Toggle>
        </Tooltip>

        <Tooltip text="auto generate">
          <Button
            className="h-9 w-9"
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
        </Tooltip>
      </div>
      <div className="mt-auto outline outline-blue-600">
        <span>
          {transcript.startTime}:{transcript.endTime}
        </span>
        <div className={clsx(editToggled && "hidden")}>
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
            editTag={tag}
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
    </div>
  );
};

export default TranscriptEditWrapper;
