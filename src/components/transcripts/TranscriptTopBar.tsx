import React from "react";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import TranscriptVote from "./TranscriptVote";
import { Button } from "@/components/ui/common/Button";
import TranscriptDelete from "./TranscriptDelete";
import { secondsToHMS } from "@/utils";
import { TAGS } from "./edits/TranscriptTags";
import Selector from "../ui/common/Selector";
import ToolTip from "../ui/common/Tooltip";
import Toggle from "../ui/common/Toggle";
import { MdEditNote } from "react-icons/md";
import { BsInputCursorText, BsPlay } from "react-icons/bs";

import type { Transcript } from "@/types";
import type { AnnotationTags } from "@prisma/client";

const TranscriptTopBar = ({
  videoID,
  transcript,
  segmentUUID,
  initialVoteDirection,
  annotateToggled = false,
  editToggled = false,
  setTag,
  seekTo,
  setEditToggled,
  setAnnotateToggled,
}: {
  videoID: string;
  segmentUUID: string;
  transcript?: Partial<Transcript>;
  initialVoteDirection?: number;
  annotateToggled?: boolean;
  editToggled?: boolean;
  setTag?: (t: AnnotationTags) => void;
  seekTo?: (a: number, b: number) => void;
  setEditToggled?: (t: boolean) => void;
  setAnnotateToggled?: (t: boolean) => void;
}) => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex items-start justify-end gap-1 rounded-tl-lg bg-th-baseBackground px-1 py-1 sm:translate-x-0 sm:flex-row sm:justify-start sm:gap-2 sm:px-2 sm:py-0.5">
      {transcript && transcript.id && transcript.transcriptDetailsId && (
        <div
          className={clsx(
            annotateToggled || editToggled ? "hidden sm:flex" : "flex",
            "items-start gap-1 sm:gap-2"
          )}
        >
          <TranscriptVote
            videoId={videoID}
            initialDirection={initialVoteDirection}
            transcriptDetailsId={transcript.transcriptDetailsId}
            transcriptId={transcript.id}
            disabled={annotateToggled || editToggled}
          />
        </div>
      )}

      {sessionData &&
        transcript?.annotaterId &&
        sessionData.user?.id &&
        sessionData.user?.id === transcript.annotaterId && (
          <TranscriptDelete
            segmentUUID={segmentUUID}
            transcriptId={transcript.id}
            transcriptDetailsId={transcript.transcriptDetailsId}
          />
        )}

      {typeof transcript?.startTime === "number" &&
        typeof transcript?.endTime === "number" &&
        seekTo && (
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
      {annotateToggled && setTag && (
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
      {setEditToggled && (
        <div className={clsx(annotateToggled && "hidden")}>
          <ToolTip text={annotateToggled ? "" : "edit text"}>
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
          </ToolTip>
        </div>
      )}
      {setAnnotateToggled && (
        <ToolTip text={editToggled ? "" : "annotate"}>
          <Toggle
            disabled={editToggled}
            pressed={annotateToggled}
            onPressedChange={(p) => setAnnotateToggled(p)}
            className={clsx(editToggled && "pointer-events-none opacity-50")}
          >
            <MdEditNote />
          </Toggle>
        </ToolTip>
      )}

      {/* <Tooltip text={editToggled || annotateToggled ? "" : "auto generate"}>
      <TranscriptAutoGen
        transcript={transcript}
        segment={segment}
        editingToggled={editToggled || annotateToggled}
        setIsNavDisabled={setIsNavDisabled}
        setTabValue={setTabValue}
        videoID={videoID}
      />
    </Tooltip> */}
    </div>
  );
};

export default TranscriptTopBar;
