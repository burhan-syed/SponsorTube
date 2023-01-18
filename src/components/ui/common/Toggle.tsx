import * as TogglePrimitive from "@radix-ui/react-toggle";
import React from "react";
import TouchResponse from "./TouchResponse";
import useIsPressed from "@/hooks/useIsPressed";
import clsx from "clsx";

type ToggleProps = {
  className?: string;
  children: React.ReactNode;
  pressed: boolean;
  onPressedChange(p: boolean): void;
} & TogglePrimitive.ToggleProps &
  React.RefAttributes<HTMLButtonElement>;

const Toggle = ({
  className,
  children,
  pressed,
  onPressedChange,
  ...props
}: ToggleProps) => {
  const { containerRef, isPressed } = useIsPressed();
  return (
    <div ref={containerRef} className="relative">
      <TogglePrimitive.Root
        {...props}
        pressed={pressed}
        onPressedChange={onPressedChange}
        className={clsx(
          className,
          "relative z-10 flex h-9 w-9 items-center justify-center  rounded-full border border-transparent bg-th-chipBackground transition-all ease-in-out hover:border-th-chipBackground hover:bg-th-chipBackgroundHover hover:shadow data-[state=on]:border-th-chipBackground data-[state=on]:bg-th-textPrimary data-[state=on]:text-th-textPrimaryInverse"
        )}
      >
        {children}
      </TogglePrimitive.Root>
      <TouchResponse isPressed={isPressed} className="rounded-full" />
    </div>
  );
};

export default Toggle;
