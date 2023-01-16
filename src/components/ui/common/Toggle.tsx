import * as TogglePrimitive from "@radix-ui/react-toggle";
import React from "react";
import TouchResponse from "./TouchResponse";
import useIsPressed from "@/hooks/useIsPressed";

interface ToggleProps {
  children: React.ReactNode;
  pressed: boolean;
  onPressedChange(p: boolean): void;
}

const Toggle = ({ children, pressed, onPressedChange }: ToggleProps) => {
  const { containerRef, isPressed } = useIsPressed();
  return (
    <div ref={containerRef} className="relative">
      <TogglePrimitive.Root
        pressed={pressed}
        onPressedChange={onPressedChange}
        className={
          "relative z-10 flex h-9 w-9 items-center  justify-center rounded-full border border-transparent bg-th-chipBackground transition-all ease-in-out hover:bg-th-chipBackgroundHover data-[state=on]:border-th-chipBackground data-[state=on]:bg-th-textPrimary data-[state=on]:text-th-textPrimaryInverse    "
        }
      >
        {children}
      </TogglePrimitive.Root>
      <TouchResponse isPressed={isPressed} className="rounded-full" />
    </div>
  );
};

export default Toggle;
