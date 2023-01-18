import React from "react";
import * as TabsPrimitives from "@radix-ui/react-tabs";
import clsx from "clsx";
import TouchResponse from "../TouchResponse";
import useIsPressed from "@/hooks/useIsPressed";

type TabTriggerProps = {
  value: string;
  icon?: JSX.Element;
  label?: string;
  disabled?: boolean;
};

const TabTrigger = ({ value, icon, label, disabled }: TabTriggerProps) => {
  const { containerRef, isPressed } = useIsPressed();
  return (
    <TabsPrimitives.Trigger
      key={value}
      ref={containerRef}
      className={clsx(
        "relative flex h-full select-none items-center justify-center border-b-2 border-transparent p-4 pt-1 pb-0.5 uppercase text-th-textSecondary hover:text-th-textPrimary data-[state=active]:border-th-textSecondary data-[state=active]:text-th-textPrimary",
        disabled && "pointer-events-none opacity-50"
      )}
      value={value}
      disabled={disabled}
    >
      {icon && <>{icon}</>}
      {label ? label : value}
      <TouchResponse isPressed={isPressed} className="" borderClassName=" " />
    </TabsPrimitives.Trigger>
  );
};

export default TabTrigger;
