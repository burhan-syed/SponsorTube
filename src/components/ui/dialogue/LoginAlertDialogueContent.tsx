import React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { signIn } from "next-auth/react";

const LoginAlertDialogueContent = ({
  description = "You must be signed in to do this",
}: {
  description?: string;
}) => {
  return (
    <>
      <AlertDialog.Title className="AlertDialogTitle">
        Login Required
      </AlertDialog.Title>
      <AlertDialog.Description className="AlertDialogDescription">
        {description}
      </AlertDialog.Description>
      <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
        <AlertDialog.Cancel asChild>
          <button className="Button mauve">Cancel</button>
        </AlertDialog.Cancel>
        <AlertDialog.Action asChild>
          <button
            onClick={(e) => {
              e.preventDefault();
              signIn();
            }}
            className="Button red"
          >
            Login
          </button>
        </AlertDialog.Action>
      </div>
    </>
  );
};

export default LoginAlertDialogueContent;
