import React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import clsx from "clsx";

const Switch = ({
  setOnCheckedChange,
  checked,
  label,
  htmlFor,
  disabled,
}: {
  setOnCheckedChange(c: boolean): void;
  checked: boolean;
  disabled?: boolean;
  label?: string;
  htmlFor: string;
}) => {
  return (
    <>
      {label && (
        <label className={"select-none"} htmlFor={htmlFor}>
          {label}
        </label>
      )}

      <SwitchPrimitive.Root
        disabled={disabled}
        onCheckedChange={(c) => setOnCheckedChange(c)}
        checked={checked}
        className={clsx(
          "relative h-5 w-10 rounded-full bg-th-additiveBackground/20 ring-th-callToAction focus:ring-1 data-[state=checked]:bg-th-textPrimary/80",
          disabled && "opacity-50"
        )}
        id={htmlFor}
      >
        <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-[0.01rem] scale-95 rounded-full bg-th-textPrimaryInverse shadow transition-transform data-[state=checked]:translate-x-[1.99rem]" />
      </SwitchPrimitive.Root>
    </>
  );
};

export default Switch;
