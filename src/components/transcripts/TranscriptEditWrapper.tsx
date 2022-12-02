import React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import TranscriptEditor from "./TranscriptEditor";
const TranscriptEditWrapper = ({ transcript, segmentUUID }: { transcript: string, segmentUUID: string }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button>Edit</button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/30" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 max-h-[80vh] w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-md">
          <AlertDialog.Title>Edit</AlertDialog.Title>
          <AlertDialog.Description />
          <TranscriptEditor transcript={transcript} segmentUUID={segmentUUID} setOpen={setOpen} />
          {/* <div>
            <AlertDialog.Cancel asChild>
              <button className="">Cancel</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button type="submit" className="">Yes, delete account</button>
            </AlertDialog.Action>
          </div> */}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default TranscriptEditWrapper;
