import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface GeneralDialogueWrapperProps {
  content: React.ReactNode;
  children: React.ReactNode;
  triggerAlert: number;
}

const GeneralDialogueWrapper = ({
  content,
  children,
  triggerAlert,
}: GeneralDialogueWrapperProps) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (triggerAlert) {
      setOpen(true);
    }
  }, [triggerAlert]);
  return (
    <Dialog.Root open={open} onOpenChange={(o) => setOpen(o)}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded bg-white p-5 shadow-md">
          {content}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default GeneralDialogueWrapper;
