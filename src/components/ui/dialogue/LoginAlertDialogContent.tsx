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
import { signIn } from "next-auth/react";

const LoginAlertDialogContent = ({
  description = "You must be signed in to do this",
}: {
  description?: string;
}) => {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Login Required</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          className={buttonClasses({ variant: "transparent" })}
        >
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={() => signIn()}
          className={buttonClasses({ variant: "accent" })}
        >
          Login
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
};

export default LoginAlertDialogContent;
