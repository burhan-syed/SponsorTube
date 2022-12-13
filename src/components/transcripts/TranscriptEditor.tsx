import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormProps } from "react-hook-form";
import { trpc } from "@/utils/trpc";
import { z } from "zod";

const validationSchema = z.object({
  text: z.string(),
});

function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  }
) {
  const form = useForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema, undefined),
  });

  return form;
}

const TranscriptEditor = ({
  text,
  segmentUUID,
  setOpen,
  startTime,
  endTime,
}: {
  text: string;
  segmentUUID: string;
  startTime?: number|null;
  endTime?: number|null;
  setOpen(o: boolean): void;
}) => {
  const methods = useZodForm({
    schema: validationSchema,
    defaultValues: {
      text: text,
    },
  });
  const utils = trpc.useContext();
  const saveEdit = trpc.transcript.saveTranscript.useMutation({
    onSuccess() {
      setOpen(false); 
      utils.transcript.get.invalidate({ segmentUUID: segmentUUID });
    },
  });

  return (
    <>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          console.log("submit:", values);
          saveEdit.mutate({ text: values.text, segmentUUID, startTime, endTime });
        })}
      >
        <div className="">
          <label>
            Transcript
            <br />
            <textarea
              {...methods.register("text")}
              className="w-full border"
            />
          </label>
          {methods.formState.errors.text?.message && (
            <p className="text-red-700">
              {methods.formState.errors.text?.message}
            </p>
          )}
        </div>
        <div>
          <button type="submit" className="">
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default TranscriptEditor;
