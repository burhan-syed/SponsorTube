import React, { useEffect, useState } from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
interface AlertDialogueProps {
  content: React.ReactNode;
  children: React.ReactNode;
  triggerAlert: number;
}
const AlertDialogueWrapper = ({
  content,
  children,
  triggerAlert,
}: AlertDialogueProps) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (triggerAlert) {
      setOpen(true);
    }
  }, [triggerAlert]);

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={(o) => setOpen(o)}>
      <AlertDialogPrimitive.Trigger asChild>
        {children}
      </AlertDialogPrimitive.Trigger>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialogPrimitive.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded bg-white p-5 shadow-md">
          {/* <AlertDialogPrimitive.Title />
          <AlertDialogPrimitive.Description />
          <AlertDialogPrimitive.Cancel />
          <AlertDialogPrimitive.Action /> */}
          {content}
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};

export default AlertDialogueWrapper;
