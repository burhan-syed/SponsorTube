/* eslint-disable react/display-name */
import React from "react";
import * as Select from "@radix-ui/react-select";
import { BiCheck, BiChevronUp, BiChevronDown } from "react-icons/bi";

type SelectorProps = {
  selectItems: {
    text?: string;
    value: string;
  }[];
  valuePlaceholder: string;
  handler(v: string): void;
  initialValueIndex?: number;
  selectorAriaLabel?: string;
};

const SelectItem = React.forwardRef<any, any>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <Select.Item {...props} className={className} ref={forwardedRef}>
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className="absolute left-0 inline-flex w-6 items-center justify-center">
          <BiCheck />
        </Select.ItemIndicator>
      </Select.Item>
    );
  }
);

const Selector = ({
  selectItems,
  initialValueIndex,
  valuePlaceholder,
  selectorAriaLabel,
  handler,
}: SelectorProps) => {
  const [value, setValue] = React.useState(() =>
    typeof initialValueIndex === "number"
      ? selectItems?.[initialValueIndex]?.value ?? ""
      : ""
  );
  return (
    <Select.Root
      value={value}
      onValueChange={(v) => {
        setValue(v);
        handler(v);
      }}
    >
      <Select.Trigger
        className="inline-flex h-full max-w-full items-center justify-center px-6 rounded-full bg-th-chipBackground hover:bg-th-chipBackgroundHover "
        aria-label={selectorAriaLabel ?? valuePlaceholder}
      >
        <Select.Value aria-label={value} placeholder={valuePlaceholder}>
          {value ? value : valuePlaceholder}
        </Select.Value>
        <Select.Icon className="SelectIcon">
          <BiChevronDown />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="relative z-50 w-full overflow-hidden rounded-lg bg-th-raisedBackground py-2 shadow">
          <Select.ScrollUpButton className="SelectScrollButton">
            <BiChevronUp />
          </Select.ScrollUpButton>
          <Select.Viewport className="">
            <Select.Group>
              {selectItems.map((item) => (
                <SelectItem
                  className={
                    "relative flex h-9 select-none items-center p-1 pl-6 data-[highlighted]:bg-th-additiveBackground data-[highlighted]:bg-opacity-10 data-[highlighted]:outline-none cursor-pointer"
                  }
                  key={item.value}
                  value={item.value}
                >
                  {item?.text ?? item.value}
                </SelectItem>
              ))}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="SelectScrollButton">
            <BiChevronDown />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default Selector;
