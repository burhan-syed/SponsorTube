import React, { useEffect } from "react";
import { TextAnnotate } from "react-text-annotate-blend";
import Selector from "../ui/common/Selector";
import { trpc } from "@/utils/trpc";
import { AnnotationTags } from "@prisma/client";
import type { TranscriptAnnotations } from "@prisma/client";
import clsx from "clsx";

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

const TAGS = new Map<AnnotationTags, string>([
  ["BRAND", "rgb(179, 245, 66)"],
  ["PRODUCT", "#42f5f5"],
  ["OFFER", "#4b46cd"],
]);

const TranscriptAnnotator = ({
  transcript,
  editable,
  setEditable,
}: {
  transcript: {
    text: string;
    segmentUUID: string;
    id?: string;
    annotations?: TranscriptAnnotations[];
    transcriptDetailsId?:string;

  };
  editable: boolean;
  setEditable(b:boolean): void;
}) => {
  const [annotations, setAnnotations] = React.useState<
    AtLeast<TranscriptAnnotations, "start" | "end" | "text" | "tag">[]
  >(() =>
    transcript.annotations
      ? transcript.annotations.map((a) => ({
          start: a.start,
          end: a.end,
          text: a.text,
          tag: a.tag,
          color: TAGS.get(a.tag),
        }))
      : []
  );
  //keep annotations synced with displayed transcript (ie when transcript is edited)
  useEffect(() => {
    if (transcript.annotations) {
      setAnnotations(
        transcript.annotations.map((a) => ({
          start: a.start,
          end: a.end,
          text: a.text,
          tag: a.tag,
          color: TAGS.get(a.tag),
        }))
      );
    } else {
      setAnnotations([]);
    }
  }, [transcript]);

  const [tag, setTag] = React.useState<AnnotationTags>("BRAND");
  const utils = trpc.useContext();
  const submitAnnotations = trpc.transcript.saveAnnotations.useMutation({
    async onSuccess() {
      const transcriptInvalidate = utils.transcript.get.invalidate({ segmentUUID: transcript.segmentUUID });
      if (transcript?.annotations?.[0]?.transcriptDetailsId) {
        utils.transcript.getMyVote.invalidate({
          transcriptDetailsId:
            transcript?.annotations?.[0]?.transcriptDetailsId,
        });
      }
      await transcriptInvalidate; 
      setEditable(false);
    },
  });
  const handleChange = (annotation: any) => {
    setAnnotations(annotation);
  };

  return (
    <>
      <div>
        <div>transcript id:{transcript.id}</div>
        {editable && (
          <Selector
            selectItems={Array.from(TAGS.keys()).map((t) => ({ value: t }))}
            valuePlaceholder="select.."
            initialValueIndex={0}
            handler={(v: AnnotationTags) => setTag(v)}
          />
        )}

        <TextAnnotate
          className={clsx(
            "font-mono",
            editable ? " " : " pointer-events-none "
          )}
          content={transcript.text}
          onChange={handleChange}
          value={annotations}
          getSpan={(span) => ({
            ...span,
            tag: tag,
            color: TAGS.get(tag),
          })}
        />
      </div>
      <div>
        <ul>
          {annotations.map((annotation) => (
            <li
              key={annotation.start}
            >{`${annotation.text} (${annotation.tag})`}</li>
          ))}
        </ul>
        {/* <pre>{JSON.stringify(annotations, null, 2)}</pre> */}
      </div>
      {editable && (
        <button
          disabled={!editable || submitAnnotations.isLoading}
          onClick={() => {
            submitAnnotations.mutate({
              transcriptId: transcript.id,
              segmentUUID: transcript.segmentUUID,
              transcript: transcript.text,
              transcriptDetailsId: transcript.transcriptDetailsId,
              annotations,
            });
          }}
        >
          Submit
        </button>
      )}
    </>
  );
};

export default TranscriptAnnotator;
