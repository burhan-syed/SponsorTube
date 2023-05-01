import * as TogglePrimitive from "@radix-ui/react-toggle";
import React from "react";
import TouchResponse from "./TouchResponse";
import useIsPressed from "@/hooks/useIsPressed";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-colors data-[state=on]:bg-th-textPrimary data-[state=on]:text-th-textPrimaryInverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-th-callToAction focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background  hover:shadow hover:bg-th-chipBackgroundHover ",
  {
    variants: {
      variant: {
        default: "bg-th-chipBackground",
        outline:
          "bg-th-chipBackground border border-transparent hover:border-th-chipBackground data-[state=on]:border-th-chipBackground ",
      },
      size: {
        default: "h-9 w-9",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => {
  const { containerRef, isPressed } = useIsPressed();

  return (
    <div ref={containerRef} className="relative">
      <TogglePrimitive.Root
        ref={ref}
        className={cn(toggleVariants({ variant, size, className }))}
        {...props}
      />
      <TouchResponse isPressed={isPressed} className="rounded-full" />
    </div>
  );
});

Toggle.displayName = TogglePrimitive.Root.displayName;

// export { Toggle, toggleVariants };
export default Toggle;
