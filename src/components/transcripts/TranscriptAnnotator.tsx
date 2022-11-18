import React from "react";
import { TextAnnotate } from "react-text-annotate-blend";
import Selector from "../forms/Selector";
import { trpc } from "@/utils/trpc";
import { AnnotationTags } from "@prisma/client";

const TranscriptAnnotator = ({
  transcript,
}: {
  transcript: { text: string; segmentUUID: string; id?: string };
}) => {
  const [annotations, setAnnotations] = React.useState<any>([]);
  const [tag, setTag] = React.useState<AnnotationTags>("BRAND");
  const submitAnnotations = trpc.transcript.saveAnnotations.useMutation();
  const handleChange = (annotation: any) => {
    setAnnotations(annotation);
  };

  const TAGS = new Map<AnnotationTags, string>([
    ["BRAND", "rgb(179, 245, 66)"],
    ["PRODUCT", "#42f5f5"],
    ["OFFER", "#4b46cd"],
  ]);

  return (
    <>
      <div>
        <TextAnnotate
          className="font-mono"
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
        <pre>{JSON.stringify(annotations, null, 2)}</pre>
      </div>
      <button
        onClick={() => {
          submitAnnotations.mutate({
            transcriptId: transcript.id,
            segmentUUID: transcript.segmentUUID,
            transcript: transcript.text,
            annotations,
          });
        }}
      >
        Submit
      </button>
      <Selector
        selectItems={Array.from(TAGS.keys()).map((t) => ({ value: t }))}
        valuePlaceholder="select.."
        initialValueIndex={0}
        handler={(v: AnnotationTags) => setTag(v)}
      />
    </>
  );
};

export default TranscriptAnnotator;
