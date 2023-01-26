import React from "react";
import clsx from "clsx";

const TouchResponse = ({
  isPressed,
  className,
  variant = "border",
}: {
  isPressed: boolean;
  className?: string;
  borderClassName?: string;
  variant?: "ring" | "border";
}) => {
  return (
    <div className={clsx("pointer-events-none absolute inset-0", className)}>
      <div
        className={clsx(
          "absolute inset-0 transition-colors",
          className,
          variant === "border" ? "border" : variant === "ring" && "ring-1",
          isPressed
            ? `${
                variant === "border"
                  ? "border-th-touchResponse"
                  : variant === "ring" && "ring-th-touchResponse"
              }`
            : `${
                variant === "border"
                  ? "border-transparent"
                  : variant === "ring" && "ring-transparent"
              } delay-200 duration-75 ease-out `
        )}
      ></div>
      <div
        className={clsx(
          "absolute inset-0 transition-colors ",
          className,
          isPressed ? "bg-th-touchResponse" : "bg-th-transparent"
        )}
      ></div>
    </div>
  );
};

export default TouchResponse;
