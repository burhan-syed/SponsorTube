import React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
interface ActionAlertDialogueContentProps {
  title?: string;
  description?: string;
  action(): any;
}
const ActionAlertDialogueContent = ({
  action,
  description,
  title,
}: ActionAlertDialogueContentProps) => {
  return (
    <>
      <AlertDialog.Title className="AlertDialogTitle">
        {title}
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
              action();
            }}
            className="Button red"
          >
            Do
          </button>
        </AlertDialog.Action>
      </div>
    </>
  );
};

export default ActionAlertDialogueContent;
