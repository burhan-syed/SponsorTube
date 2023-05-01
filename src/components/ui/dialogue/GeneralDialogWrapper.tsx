import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./DialogPrimitives";

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
    <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>{content}</DialogContent>
    </Dialog>
  );
};

export default GeneralDialogueWrapper;
