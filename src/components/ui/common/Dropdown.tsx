import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import useIsPressed from "@/hooks/useIsPressed";
import TouchResponse from "./TouchResponse";
import { useState, cloneElement, JSXElementConstructor } from "react";

const Dropdown = ({
  children,
  MenuItems,
  disabled,
  modal = true,
  menuOptions = {
    sideOffset: 5,
  },
}: {
  children: React.ReactElement<any, string | JSXElementConstructor<any>>;
  modal?: boolean;
  MenuItems?: JSX.Element[];
  disabled?: boolean;
  menuOptions?: DropdownMenu.MenuContentProps;
}) => {
  const { isPressed, containerRef } = useIsPressed();
  const [isOpen, setIsOpen] = useState<boolean>();
  return (
    <>
      <DropdownMenu.Root onOpenChange={(o) => setIsOpen(o)} modal={modal}>
        <DropdownMenu.Trigger disabled={disabled} asChild>
          <button
            ref={containerRef}
            className="relative flex w-full items-center justify-center rounded-full bg-th-chipBackground hover:bg-th-chipBackgroundHover"
            aria-label="options"
          >
            {cloneElement(children, { isOpen: isOpen })}
            <TouchResponse isPressed={isPressed} className="rounded-full" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 flex min-w-[20rem] flex-col overflow-hidden rounded-lg bg-th-raisedBackground py-1 shadow "
            //sm:relative sm:top-auto sm:left-auto sm:w-full sm:translate-y-0 sm:translate-x-0 left-1/2 fixed top-1/2  w-[80vw] -translate-x-1/2 -translate-y-1/2
            {...menuOptions}
          >
            {MenuItems?.map((el, i) => (
              <DropdownMenu.Item
                key={el.key}
                className="relative flex h-9  cursor-pointer select-none items-center px-2 py-1 data-[highlighted]:bg-th-additiveBackground data-[highlighted]:bg-opacity-10 data-[highlighted]:outline-none"
                asChild
              >
                {el}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {/* {isOpen && (
        <div className="fixed top-0 left-0 z-50 h-full w-full bg-black/20 backdrop-blur-sm sm:pointer-events-none sm:invisible"></div>
      )} */}
    </>
  );
};

export default Dropdown;
