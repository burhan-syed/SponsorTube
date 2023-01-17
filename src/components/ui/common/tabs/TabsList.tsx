import React from "react";
import * as TabsPrimitives from "@radix-ui/react-tabs";
import TabTrigger from "./TabTrigger";

type TabsProps = {
  tabsList: {
    value: string;
    icon?: JSX.Element;
    label?: string;
    disabled?: boolean;
  }[];
};

const TabsList = ({ tabsList }: TabsProps) => {
  return (
    <TabsPrimitives.List aria-label="tabs example" className="flex justify-end sm:justify-start h-full">
      {tabsList.map((tab) => (
        <TabTrigger key={tab.value} {...tab} />
      ))}
    </TabsPrimitives.List>
  );
};

export default TabsList;
