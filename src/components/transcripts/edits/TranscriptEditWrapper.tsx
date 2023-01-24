import React, { useEffect, useState } from "react";

import Toggle from "../../ui/common/Toggle";
import { MdEditNote } from "react-icons/md";
import { BsInputCursorText, BsPlay } from "react-icons/bs";
import { BiBrain } from "react-icons/bi";
import TranscriptAnnotator from "./TranscriptAnnotator";
import Tooltip from "../../ui/common/Tooltip";
import TranscriptEditor from "./TranscriptEditor";
import clsx from "clsx";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/common/Button";
import Selector from "@/components/ui/common/Selector";

import { TAGS } from "./TranscriptTags";
import TranscriptVote from "../TranscriptVote";
import { secondsToHMS } from "@/utils";
import { useSession } from "next-auth/react";
import TranscriptDelete from "../TranscriptDelete";
import TranscriptAutoGen from "../TranscriptAutoGen";

import type { AnnotationTags, TranscriptAnnotations } from "@prisma/client";
import type { Segment } from "sponsorblock-api";

type Transcript = {
  text: string;
  annotations?: TranscriptAnnotations[];
  id?: string;
  transcriptDetailsId?: string;
  annotaterId?: string;
  startTime?: number | null;
  endTime?: number | null;
};
interface TranscriptEditWrapperProps {
  segment: Segment;
  videoID: string;
  transcript: Transcript;
  initialVoteDirection?: number;
  seekTo(start: number, end: number): void;
  setTabValue?(v: string): void;
  setIsNavDisabled?(d: boolean): void;
}

const TranscriptEditWrapper = ({
  segment,
  videoID,
  transcript,
  setTabValue,
  seekTo,
  initialVoteDirection,
  setIsNavDisabled,
}: TranscriptEditWrapperProps) => {
  const { data: sessionData } = useSession();
  const [editToggled, setEditToggled] = useState(false);
  const [annotateToggled, setAnnotateToggled] = useState(false);
  const [tag, setTag] = React.useState<AnnotationTags>("BRAND");

  useEffect(() => {
    if (setIsNavDisabled) {
      if (editToggled || annotateToggled) {
        setIsNavDisabled(true);
      } else {
        setIsNavDisabled(false);
      }
    }
  }, [editToggled, annotateToggled, setIsNavDisabled]);

  return (
    <div className="flex flex-grow flex-col">
      <div
        className="flex items-start justify-end gap-1 rounded-tl-lg bg-th-baseBackground px-1 py-1 sm:translate-x-0 sm:flex-row sm:justify-start sm:gap-2 sm:px-2 sm:py-0.5"
        //-translate-x-1/2
      >
        {transcript.id && transcript.transcriptDetailsId && (
          <div
            className={clsx(
              annotateToggled || editToggled ? "hidden sm:flex" : "flex",
              "items-start gap-1 sm:gap-2"
            )}
          >
            <TranscriptVote
              initialDirection={initialVoteDirection}
              transcriptDetailsId={transcript.transcriptDetailsId}
              transcriptId={transcript.id}
              disabled={annotateToggled || editToggled}
            />
          </div>
        )}

        {sessionData &&
          ((sessionData.user?.id &&
            sessionData.user?.id === transcript.annotaterId) ||
            transcript.annotaterId === "_openaicurie") && (
            <TranscriptDelete
              segmentUUID={segment.UUID}
              transcriptId={transcript.id}
              transcriptDetailsId={transcript.transcriptDetailsId}
            />
          )}

        {transcript?.startTime && transcript.endTime && (
          <div className="flex items-center gap-0.5 sm:gap-2">
            <Button
              round
              onClick={() =>
                seekTo(
                  transcript.startTime as number,
                  transcript.endTime as number
                )
              }
            >
              <BsPlay className="h-4 w-4 flex-none" />
            </Button>
            <span className="flex items-center gap-0.5  text-xs text-th-textSecondary sm:gap-1">
              {secondsToHMS(transcript.startTime)}
              <span>-</span>
              {secondsToHMS(transcript.endTime)}
            </span>
          </div>
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
          <Tooltip text={annotateToggled ? "" : "edit text"}>
            <Toggle
              disabled={annotateToggled}
              className={clsx(
                annotateToggled && "pointer-events-none opacity-50"
              )}
              pressed={editToggled}
              onPressedChange={(p) => setEditToggled(p)}
            >
              <BsInputCursorText />
            </Toggle>
          </Tooltip>
        </div>
        <Tooltip text={editToggled ? "" : "annotate"}>
          <Toggle
            disabled={editToggled}
            pressed={annotateToggled}
            onPressedChange={(p) => setAnnotateToggled(p)}
            className={clsx(editToggled && "pointer-events-none opacity-50")}
          >
            <MdEditNote />
          </Toggle>
        </Tooltip>

        <Tooltip text={editToggled || annotateToggled ? "" : "auto generate"}>
          <TranscriptAutoGen
            transcript={transcript}
            segment={segment}
            editingToggled={editToggled || annotateToggled}
            setIsNavDisabled={setIsNavDisabled}
            setTabValue={setTabValue}
            videoID={videoID}
          />
        </Tooltip>
      </div>
      {!editToggled && (
        <div
          className={clsx(
            editToggled ? "hidden" : "flex flex-grow flex-col p-2"
          )}
        >
          <TranscriptAnnotator
            videoID={videoID}
            segment={segment}
            transcript={transcript}
            editable={annotateToggled}
            setEditable={setAnnotateToggled}
            setTabValue={setTabValue}
            editTag={tag}
          />
        </div>
      )}

      {editToggled && (
        <div
          className={clsx(
            editToggled ? "flex flex-grow flex-col p-2" : "hidden"
          )}
        >
          <TranscriptEditor
            text={transcript.text}
            segmentUUID={segment.UUID}
            startTime={transcript.startTime}
            endTime={transcript.endTime}
            setOpen={(o: boolean) => setEditToggled(o)}
            setTabValue={setTabValue}
          />
        </div>
      )}
    </div>
  );
};

export default TranscriptEditWrapper;
