import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { BiChevronDown } from "react-icons/bi";
import { cn } from "@/utils/cn";
import useIsPressed from "@/hooks/useIsPressed";
import TouchResponse from "../TouchResponse";

const AccordionRoot = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const { containerRef, isPressed, triggerPress } = useIsPressed();

  return (
    <AccordionPrimitive.Header
      ref={containerRef}
      className="relative flex rounded-2xl"
    >
      <AccordionPrimitive.Trigger
        ref={containerRef}
        onClick={triggerPress}
        className={cn(
          "text-p flex flex-1 items-center justify-between rounded-2xl py-4 font-semibold transition-all hover:bg-th-touchResponse [&[data-state=open]>svg]:rotate-180 gap-x-4",
          className
        )}
        {...props}
      >
        {children}
        <BiChevronDown className="h-4 w-4 flex-none transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
      <TouchResponse isPressed={isPressed} className="rounded-2xl px-4" />
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent };
