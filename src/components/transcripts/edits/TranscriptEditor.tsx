import React, { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormProps } from "react-hook-form";
import { trpc } from "@/utils/trpc";
import { z } from "zod";
import { Button } from "@/components/ui/common/Button";
import clsx from "clsx";

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
  setTabValue,
}: {
  text: string;
  segmentUUID: string;
  startTime?: number | null;
  endTime?: number | null;
  setOpen(o: boolean): void;
  setTabValue?(v: string): void;
}) => {
  const methods = useZodForm({
    schema: validationSchema,
    defaultValues: {
      text: text,
    },
  });
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const [textAreaFocused, setTextAreaFocused] = useState(false);
  useEffect(() => {
    if (textAreaRef?.current?.scrollHeight) {
      textAreaRef.current.style.height = `${
        textAreaRef?.current?.scrollHeight + 3
      }px`;
      textAreaRef.current.focus();
    }
    return () => {
      //
    };
  }, []);

  const utils = trpc.useContext();
  const saveEdit = trpc.transcript.saveTranscript.useMutation({
    async onSuccess() {
      await utils.transcript.get.invalidate({ segmentUUID: segmentUUID });
      setOpen(false);
      setTabValue && setTabValue("user");
    },
  });

  return (
    <>
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          console.log("submit:", values);
          saveEdit.mutate({
            text: values.text,
            segmentUUID,
            startTime,
            endTime,
          });
        })}
        className="flex flex-grow flex-col justify-between gap-2"
      >
        <div className="flex flex-col py-1">
          <textarea
            {...methods.register("text")}
            onFocus={() => setTextAreaFocused(true)}
            onBlur={() => setTextAreaFocused(false)}
            ref={(el) => {
              methods.register("text").ref(el);
              if (el) textAreaRef.current = el;
            }}
            className="h-full w-full resize-none p-0  font-mono leading-loose outline-none bg-transparent"
          />
          <div className="relative h-[0.1rem] w-full bg-th-textSecondary">
            <div
              className={clsx(
                "absolute h-[0.2rem]  w-full origin-center bg-th-textPrimary transition-transform ease-in-out",
                textAreaFocused ? "scale-x-100 duration-500 " : "scale-x-0 duration-[0ms]"
              )}
            ></div>
          </div>
          {methods.formState.errors.text?.message && (
            <p className="text-red-700">
              {methods.formState.errors.text?.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-1">
          <Button
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            variant={"primary"}
            type="button"
            className=""
          >
            Cancel
          </Button>
          <Button variant={"accent"} type="submit" className="">
            Submit
          </Button>
        </div>
      </form>
    </>
  );
};

export default TranscriptEditor;
