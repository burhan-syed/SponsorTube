import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import useIsPressed from "@/hooks/useIsPressed";
import TouchResponse from "./TouchResponse";

const Dropdown = ({
  TriggerElementChildren,
  MenuItems,
  disabled,
  menuOptions = {
    sideOffset: 5,
  },
}: {
  TriggerElementChildren: JSX.Element;
  MenuItems?: JSX.Element[];
  disabled?: boolean;
  menuOptions?: DropdownMenu.MenuContentProps;
}) => {
  const { isPressed, containerRef } = useIsPressed();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger disabled={disabled} asChild>
        <button
          ref={containerRef}
          className="relative flex items-center justify-center rounded-full bg-th-chipBackground px-4 py-2 hover:bg-th-chipBackgroundHover"
          aria-label="options"
        >
          {TriggerElementChildren}
          <TouchResponse isPressed={isPressed} className="rounded-full" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="relative z-50 flex w-full min-w-[20rem] flex-col overflow-hidden rounded-lg bg-th-raisedBackground py-1 shadow"
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
  );
};

export default Dropdown;
