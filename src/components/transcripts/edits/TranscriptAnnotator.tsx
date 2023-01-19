import React, { useEffect, useMemo } from "react";
import { TextAnnotate } from "react-text-annotate-blend";
import Selector from "../../ui/common/Selector";
import { trpc } from "@/utils/trpc";
import { AnnotationTags } from "@prisma/client";
import type { TranscriptAnnotations } from "@prisma/client";
import clsx from "clsx";
import { textFindIndices } from "@/utils";
import { TAGS, TAGCLASSES } from "./TranscriptTags";
import { Button } from "@/components/ui/common/Button";
import { BsX } from "react-icons/bs";

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

const TranscriptAnnotator = ({
  transcript,
  editable,
  setEditable,
  setTabValue,
  editTag,
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
  editTag?: AnnotationTags;
}) => {
  const [tag, setTag] = React.useState<AnnotationTags>(
    () => editTag ?? "BRAND"
  );
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
          className: TAGCLASSES,
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
        className: TAGCLASSES,
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
    if (!editable) {
      if (transcript.annotations) {
        setAnnotations(
          transcript.annotations.map((a) => ({
            start: a.start,
            end: a.end,
            text: a.text,
            tag: a.tag,
            color: TAGS.get(a.tag),
            className: TAGCLASSES,
          }))
        );
      } else {
        setAnnotations([]);
      }
    }
  }, [transcript, editable]);
  useEffect(() => {
    if (editTag) {
      setTag(editTag);
    }
  }, [editTag]);

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

      if ((!p || annotation.length > p.length) && newAnnotation?.text?.trim()) {
        return matchAndReturnNewAnnotations(p, newAnnotation);
      }
      return annotation.filter((a) => a.text.trim());
    });
  };

  //TODO
  const areSegmentsSame = useMemo(() => {
    if (!transcript.annotations) {
      return false;
    }
    return true;
  }, [transcript.annotations, annotations]);

  return (
    <>
      {editable && !editTag && (
        <div className="h-9 w-32">
          <Selector
            selectItems={Array.from(TAGS.keys()).map((t) => ({ value: t }))}
            valuePlaceholder="select.."
            initialValueIndex={0}
            handler={(v: AnnotationTags) => setTag(v)}
          />
        </div>
      )}
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
        <TextAnnotate
          className={clsx(
            "pt-1 font-mono leading-loose",
            editable ? "  " : " pointer-events-none "
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
      <div className="mt-auto pt-4">
        <ul
          className={clsx(
            "flex flex-row flex-wrap items-center gap-1",
            !editable && "py-1"
          )}
        >
          {annotations
            .filter(
              (value, index, self) =>
                index ===
                self.findIndex(
                  (a) =>
                    a.text.toUpperCase() === value.text.toUpperCase() &&
                    a.tag === value.tag
                )
            )
            .map((annotation) => (
              <li key={annotation.start}>
                <Button
                  disabled={!editable}
                  onClick={() =>
                    setAnnotations((p) =>
                      p.filter(
                        (a) =>
                          !(
                            a.tag === annotation.tag &&
                            a.text.toUpperCase() ===
                              annotation.text.toUpperCase()
                          )
                      )
                    )
                  }
                  variant={"primary"}
                  size={"small"}
                  className="group"
                >
                  <div
                    className={clsx(
                      "z-10 flex items-center gap-1",
                      editable && "-translate-x-1"
                    )}
                  >
                    {editable && (
                      <BsX className="h-4 w-4 flex-none transition-transform group-hover:scale-125" />
                    )}
                    <span className="">{`${annotation.text}`}</span>
                  </div>

                  <div
                    className="absolute h-full w-full rounded-full backdrop-blur-md"
                    style={{ backgroundColor: `${TAGS.get(annotation.tag)}90` }}
                  ></div>
                </Button>
              </li>
            ))}
          {editable && (
            <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
              <Button
                disabled={!editable || submitAnnotations.isLoading}
                onClick={() => {
                  setEditable(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={"accent"}
                requireSession={{
                  required: true,
                  reason: "Please login to submit transcript annotations!",
                }}
                disabled={
                  !editable ||
                  submitAnnotations.isLoading ||
                  areSegmentsSame ||
                  !(annotations.length > 0)
                }
                loading={submitAnnotations.isLoading}
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
              </Button>
            </div>
          )}
        </ul>
        {/* <pre>{JSON.stringify(annotations, null, 2)}</pre> */}
      </div>
    </>
  );
};

export default TranscriptAnnotator;
