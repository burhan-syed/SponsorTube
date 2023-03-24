import React, { useEffect, useRef, useState } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const ToolTip = ({
  children,
  text,
  manualControl,
  tooltipOptions = { side: "bottom", sideOffset: 10 },
}: {
  children: React.ReactNode;
  text: string | React.ReactNode;
  manualControl?: boolean;
  tooltipOptions?: TooltipPrimitive.TooltipContentProps;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>();
  const [focused, setFocused] = useState(false); 
  const triggerRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let timeout: any;
    if (isOpen && manualControl && focused) {
      timeout = setTimeout(() => {console.log("blur?", triggerRef?.current?.blur); setIsOpen(false); setFocused(false);  if(triggerRef.current){triggerRef?.current?.blur(); triggerRef.current.tabIndex = 1}}, 2000);
    }

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [manualControl, isOpen, focused]);

  return (
    <TooltipPrimitive.Root open={manualControl ? isOpen : undefined}>
      <TooltipPrimitive.Trigger asChild>
        <span
          ref={triggerRef}
          tabIndex={0}
          onMouseEnter={() => {
            manualControl && setIsOpen(true);
          }}
          onMouseLeave={() => {
            manualControl && setIsOpen(false);
          }}
          onFocus={() => {
            if(manualControl) {setIsOpen(true); setFocused(true);}
          }}
          onBlur={() => {
            manualControl && setIsOpen(false);
          }}
        >
          {children}
        </span>
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

export default ToolTip;
