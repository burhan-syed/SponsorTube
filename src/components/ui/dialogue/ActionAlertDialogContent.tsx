import React from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/dialogue/AlertDialogPrimitives";
import { buttonClasses } from "../common/Button";

interface ActionAlertDialogContentProps {
  title?: string;
  description?: string;
  action(): any;
}
const ActionAlertDialogContent = ({
  action,
  description,
  title,
}: ActionAlertDialogContentProps) => {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          className={buttonClasses({ variant: "transparent" })}
        >
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={() => action()}
          className={buttonClasses({ variant: "accent" })}
        >
          Yes
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
};

export default ActionAlertDialogContent;
