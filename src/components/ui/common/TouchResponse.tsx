import React from "react";
import clsx from "clsx";

const TouchResponse = ({
  isPressed,
  className,
  borderClassName = "ring-1"
}: {
  isPressed: boolean;
  className?: string;
  borderClassName?: string;
}) => {
  return (
    <div className={clsx("pointer-events-none absolute inset-0", className)}>
      <div
        className={clsx(
          "absolute inset-0 transition-colors",
          className,
          borderClassName,
          isPressed
            ? "ring-th-touchResponse"
            : "ring-transparent delay-200 duration-75 ease-out "
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
