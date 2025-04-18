import React from "react";
import {
  AccordionRoot,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./AccordionPrimitives";

export type AccordionItemType = {
  value: string;
  trigger: string | React.ReactElement;
  content: string | React.ReactElement;
};

const Accordion = ({ items }: { items: AccordionItemType[] }) => {
  return (
    <AccordionRoot type="single" collapsible>
      {items.map(({ value, trigger, content }) => (
        <AccordionItem key={value} value={value} className="border-transparent">
          <AccordionTrigger className="px-4"><div className="text-left">{trigger}</div></AccordionTrigger>
          <AccordionContent className="px-4">{content}</AccordionContent>
        </AccordionItem>
      ))}
    </AccordionRoot>
  );
};

export default Accordion;
