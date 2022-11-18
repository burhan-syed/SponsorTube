import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormProps } from "react-hook-form";
import { trpc } from "@/utils/trpc";
import { z } from "zod";

const validationSchema = z.object({
  transcript: z.string(),
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
const TranscriptEditor = ({ transcript }: { transcript: string }) => {
  const methods = useZodForm({
    schema: validationSchema,
    defaultValues: {
      transcript: transcript,
    },
  });
  return (
    <>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          console.log("submit:", values);
        })}
      >
        <div>
          <label>
            Transcript
            <br />
            <textarea {...methods.register("transcript")} className="border" />
          </label>
          {methods.formState.errors.transcript?.message && (
            <p className="text-red-700">
              {methods.formState.errors.transcript?.message}
            </p>
          )}
        </div>
      </form>
    </>
  );
};

export default TranscriptEditor;
