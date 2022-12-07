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
        className="inline-flex h-9 items-center justify-center rounded bg-white px-4 hover:bg-slate-400 focus:shadow-md"
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
        <Select.Content className="overflow-hidden rounded bg-white shadow">
          <Select.ScrollUpButton className="SelectScrollButton">
            <BiChevronUp />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-1">
            <Select.Group>
              {selectItems.map((item) => (
                <SelectItem
                  className={
                    "relative flex h-6 select-none items-center rounded-sm pl-6 p-1 data-[highlighted]:bg-blue-300 data-[highlighted]:outline-none"
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
