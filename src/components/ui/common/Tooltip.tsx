import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const TooltipContainer = ({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) => {
  return (
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="TooltipContent" sideOffset={5}>
            {text}
            <TooltipPrimitive.Arrow className="TooltipArrow" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
  );
};

export default TooltipContainer;
