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
  disabled?: boolean;
};

const TabsList = ({ tabsList, disabled = false }: TabsProps) => {
  return (
    <TabsPrimitives.List aria-label="tabs example" className="flex h-full">
      {tabsList.map((tab) => (
        <TabTrigger
          key={tab.value}
          {...tab}
          disabled={disabled ? disabled : tab?.disabled ?? false}
        />
      ))}
    </TabsPrimitives.List>
  );
};

export default TabsList;
