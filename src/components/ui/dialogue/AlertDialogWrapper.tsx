import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/dialogue/AlertDialogPrimitives";
interface AlertDialogProps {
  content: React.ReactNode;
  children: React.ReactNode;
  triggerAlert: number;
}
const AlertDialogWrapper = ({
  content,
  children,
  triggerAlert,
}: AlertDialogProps) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (triggerAlert) {
      setOpen(true);
    }
  }, [triggerAlert]);

  return (
    <AlertDialog open={open} onOpenChange={(o) => setOpen(o)}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>{content}</AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogWrapper;
