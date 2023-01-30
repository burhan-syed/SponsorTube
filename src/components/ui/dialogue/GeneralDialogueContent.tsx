import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "../common/Button";

const GeneralDialogueContent = ({
  title = "",
  description = "",
  close = "ok",
}: {
  title?: string;
  description?: string;
  close?: string;
}) => {
  return (
    <>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>{description}</Dialog.Description>
      <Dialog.Close asChild>
        <Button>{close}</Button>
      </Dialog.Close>
    </>
  );
};

export default GeneralDialogueContent;
