import React, { useEffect } from "react";
import { TextAnnotate } from "react-text-annotate-blend";
import Selector from "../../ui/common/Selector";
import { trpc } from "@/utils/trpc";
import { AnnotationTags } from "@prisma/client";
import type { TranscriptAnnotations } from "@prisma/client";
import clsx from "clsx";
import { textFindIndices } from "@/utils";

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
  setTabValue,
}: {
  transcript: {
    text: string;
    segmentUUID: string;
    id?: string;
    annotations?: TranscriptAnnotations[];
    transcriptDetailsId?: string;
    startTime?: number | null;
    endTime?: number | null;
  };
  editable: boolean;
  setEditable(b: boolean): void;
  setTabValue?(v: string): void;
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
  const matchAndReturnNewAnnotations = (
    p: AtLeast<TranscriptAnnotations, "start" | "end" | "text" | "tag">[],
    newAnnotation: AtLeast<TranscriptAnnotations, "text" | "tag">
  ) => {
    const matchingAnnotations = textFindIndices(
      transcript.text,
      newAnnotation.text
    );
    const withMatching = [
      ...p,
      ...matchingAnnotations.map((i) => ({
        start: i,
        end: i + newAnnotation.text.length,
        text: transcript.text.substring(i, i + newAnnotation.text.length),
        tag: newAnnotation.tag,
        color: TAGS.get(newAnnotation.tag),
      })),
    ].filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.start === value.start ||
            (t.end > value.start && t.start < value.end)
        )
    );
    // console.log("matching?", withMatching);
    return withMatching;
  };

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
      const transcriptInvalidate = utils.transcript.get.invalidate({
        segmentUUID: transcript.segmentUUID,
      });
      if (transcript?.annotations?.[0]?.transcriptDetailsId) {
        utils.transcript.getMyVote.invalidate({
          transcriptDetailsId:
            transcript?.annotations?.[0]?.transcriptDetailsId,
        });
      }
      await transcriptInvalidate;
      setEditable(false);
      setTabValue && setTabValue("user");
    },
  });
  const handleChange = (
    annotation: AtLeast<
      TranscriptAnnotations,
      "start" | "end" | "text" | "tag"
    >[]
  ) => {
    setAnnotations((p) => {
      const newAnnotation = annotation?.[annotation.length - 1];

      if ((!p || annotation.length > p.length) && newAnnotation?.text) {
        return matchAndReturnNewAnnotations(p, newAnnotation);
      }
      return annotation;
    });
  };

  return (
    <>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          let selected = window.getSelection()?.toString();
          //cleanup tag from selection on mobile
          TAGS.forEach((v, k) => {
            if (
              selected &&
              selected?.length > k.length &&
              selected.slice(-k.length) === k
            ) {
              // console.log(`(${selected.slice(0,selected.length-k.length)})`)
              selected = selected.slice(0, selected.length - k.length);
            }
          });
          if (editable && selected) {
            setAnnotations((p) => {
              if (
                p &&
                p.find(
                  (pred) => pred.text.toUpperCase() === selected?.toUpperCase()
                )
              ) {
                return p.filter(
                  (pred) => pred.text.toUpperCase() !== selected?.toUpperCase()
                );
              }
              return matchAndReturnNewAnnotations(p, {
                text: selected ?? "",
                tag: tag,
              });
            });
          }
        }}
      >
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
              startTime: transcript.startTime,
              endTime: transcript.endTime,
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
