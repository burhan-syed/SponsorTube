import * as TogglePrimitive from "@radix-ui/react-toggle";
import React from "react";

interface ToggleProps {
  children: React.ReactNode;
  pressed: boolean;
  onPressedChange(p: boolean): void;
}

const Toggle = ({ children, pressed, onPressedChange }: ToggleProps) => (
  <TogglePrimitive.Root
    pressed={pressed}
    onPressedChange={onPressedChange}
    className={"flex h-6 w-6 items-center justify-center rounded-md data-[state=on]:bg-blue-400 bg-white"}
  >
    {children}
  </TogglePrimitive.Root>
);

export default Toggle;
