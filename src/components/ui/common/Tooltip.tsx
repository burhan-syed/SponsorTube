import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const TooltipContainer = ({
  children,
  text,
  tooltipOptions = { side: "bottom", sideOffset: 10 },
}: {
  children: React.ReactNode;
  text: string;
  tooltipOptions?: TooltipPrimitive.TooltipContentProps;
}) => {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        <span tabIndex={0}>{children}</span>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        {text && (
          <TooltipPrimitive.Content
            className={
              "select-none rounded-md bg-th-tooltipBackground/80 p-2 py-1 text-xs font-semibold text-th-tooltipText transition-opacity data-[state=delayed-open]:animate-[fadeIn_100ms_ease-in-out_forwards] data-[state=instant-open]:animate-[fadeIn_20ms_ease-in-out_forwards] "
            }
            {...tooltipOptions}
          >
            {text}
            {/* <TooltipPrimitive.Arrow className="TooltipArrow" /> */}
          </TooltipPrimitive.Content>
        )}
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};

export default TooltipContainer;
