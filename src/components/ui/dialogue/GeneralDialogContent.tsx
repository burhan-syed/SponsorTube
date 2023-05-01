import React from "react";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./DialogPrimitives";
import { Button } from "../common/Button";

const GeneralDialogContent = ({
  title = "",
  description = "",
  content = <></>,
  close = "ok",
}: {
  title?: string;
  description?: string;
  content?: JSX.Element;
  close?: string;
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {content}
      <DialogFooter>
        <DialogClose asChild>
          <Button>{close}</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
};

export default GeneralDialogContent;
