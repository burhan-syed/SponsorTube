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
        className="SelectTrigger"
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
        <Select.Content className="SelectContent">
          <Select.ScrollUpButton className="SelectScrollButton">
            <BiChevronUp />
          </Select.ScrollUpButton>
          <Select.Viewport className="SelectViewport">
            <Select.Group>
              {selectItems.map((item) => (
                <SelectItem
                  className={"flex"}
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

const SelectItem = React.forwardRef<any, any>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <Select.Item {...props} className={className} ref={forwardedRef}>
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className="SelectItemIndicator">
          <BiCheck />
        </Select.ItemIndicator>
      </Select.Item>
    );
  }
);

export default Selector;
