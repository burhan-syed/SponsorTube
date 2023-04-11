import React, { useEffect, useState } from "react";

import TranscriptAnnotator from "./TranscriptAnnotator";
import TranscriptEditor from "./TranscriptEditor";
import TranscriptTopBar from "../TranscriptTopBar";

import clsx from "clsx";

import type { AnnotationTags, TranscriptAnnotations } from "@prisma/client";
import type { Segment } from "sponsorblock-api";
import type { Transcript } from "@/types";
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
      <TranscriptTopBar
        segmentUUID={segment.UUID}
        transcript={transcript}
        videoID={videoID}
        initialVoteDirection={initialVoteDirection}
        annotateToggled={annotateToggled}
        setAnnotateToggled={setAnnotateToggled}
        editToggled={editToggled}
        setEditToggled={setEditToggled}
        seekTo={seekTo}
        setTag={setTag}
      />
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
