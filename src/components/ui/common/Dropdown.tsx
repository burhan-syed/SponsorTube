import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import useIsPressed from "@/hooks/useIsPressed";
import TouchResponse from "./TouchResponse";
import { useState, cloneElement, JSXElementConstructor } from "react";
import { cn } from "@/utils/cn";
const Dropdown = ({
  children,
  MenuItems,
  disabled,
  modal = true,
  menuHeader = {
    title: "",
    description: "",
    force: false,
  },
  menuOptions = {
    sideOffset: 5,
  },
}: {
  children: React.ReactElement<any, string | JSXElementConstructor<any>>;
  modal?: boolean;
  MenuItems?: JSX.Element[];
  disabled?: boolean;
  menuOptions?: DropdownMenu.MenuContentProps;
  menuHeader?: { title?: string; description?: string; force?: boolean };
}) => {
  const { isPressed, containerRef } = useIsPressed();
  const [isOpen, setIsOpen] = useState<boolean>();

  return (
    <>
      <DropdownMenu.Root onOpenChange={(o) => setIsOpen(o)} modal={modal}>
        <DropdownMenu.Trigger disabled={disabled} asChild>
          <button
            ref={containerRef}
            className="relative flex w-full flex-none items-center justify-center rounded-full bg-th-chipBackground hover:bg-th-chipBackgroundHover"
            aria-label="options"
          >
            {cloneElement(children, {
              //lowercase to appease ReactDOM errors
              isopen: isOpen,
            })}
            <TouchResponse isPressed={isPressed} className="rounded-full" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal id="dropdownportal">
          <>
            <DropdownMenu.Content
              className="fixed bottom-0 left-0 z-50 flex w-full min-w-[20rem] scale-100 flex-col overflow-hidden  rounded-t-lg bg-th-raisedBackground p-6 shadow animate-in fade-in-90 slide-in-from-bottom-10 sm:relative sm:bottom-auto sm:w-auto sm:min-w-[calc(var(--radix-popper-anchor-width))] sm:rounded-lg  sm:px-0 sm:py-1 sm:data-[side=bottom]:slide-in-from-top-2 sm:data-[side=left]:slide-in-from-right-2 sm:data-[side=right]:slide-in-from-left-2 sm:data-[side=top]:slide-in-from-bottom-2"
              {...menuOptions}
            >
              {(menuHeader.title || menuHeader.description) && (
                <div
                  className={cn(
                    "mb-4 flex flex-col items-center space-y-2",
                    !menuHeader.force && "sm:hidden"
                  )}
                >
                  {menuHeader.title && (
                    <h2 className="text-lg font-semibold">
                      {menuHeader.title}
                    </h2>
                  )}
                  {menuHeader.description && (
                    <p className="text-sm text-th-textSecondary">
                      {menuHeader.description}
                    </p>
                  )}
                </div>
              )}
              <ul className="flex w-full flex-col gap-y-2">
                {MenuItems?.map((el, i) => (
                  <li key={el.key} className="flex w-full flex-col">
                    <DropdownMenu.Item
                      className="[  relative flex h-9 cursor-pointer select-none items-center rounded-full border border-transparent bg-th-textPrimary px-2 py-1 text-th-textPrimaryInverse hover:border-th-chipBackground hover:shadow-md hover:ring-2  hover:ring-th-callToAction/50 data-[highlighted]:outline-none data-[highlighted]:ring-2  data-[highlighted]:ring-th-callToAction sm:mt-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:text-th-textPrimary sm:hover:shadow-none sm:hover:ring-0  sm:data-[highlighted]:bg-th-additiveBackground/10 sm:data-[highlighted]:ring-0"
                      asChild
                    >
                      {el}
                    </DropdownMenu.Item>
                  </li>
                ))}
              </ul>
            </DropdownMenu.Content>
            <div className="fixed left-0 top-0 z-40 h-full w-full bg-th-invertedBackground/50 backdrop-blur-sm transition-opacity animate-in fade-in sm:pointer-events-none sm:invisible"></div>
          </>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
};

export default Dropdown;
