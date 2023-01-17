import { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";
import TouchResponse from "./TouchResponse";
import useIsPressed from "@/hooks/useIsPressed";

type ButtonBaseProps = VariantProps<typeof buttonClasses> & {
  children: React.ReactNode;
};

interface ButtonAsAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

interface ButtonAsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: never;
}

type ButtonProps = ButtonBaseProps &
  (ButtonAsAnchorProps | ButtonAsButtonProps);

const buttonClasses = cva(
  "relative rounded-full inline-flex items-center justify-center transition-all ease-in-out ",
  {
    variants: {
      variant: {
        primary: [
          "bg-th-chipBackground hover:bg-th-chipBackgroundHover",
          "border border-transparent hover:border-th-chipBackground",
          // "[&_.highlight]:ml-2",
        ],
        transparent: [
          "bg-transparent hover:bg-th-additiveBackground hover:bg-opacity-10",
          "border border-transparent hover:border-th-chipBackground",
        ],
        secondary: [
          "text-off-white bg-white bg-opacity-10 border border-transparent-white backdrop-filter-[12px] hover:bg-opacity-20 transition-colors ease-in",
          "[&_.highlight]:bg-transparent-white [&_.highlight]:rounded-full [&_.highlight]:px-2 [&_.highlight:last-child]:ml-2 [&_.highlight:last-child]:-mr-2 [&_.highlight:first-child]:-ml-2 [&_.highlight:first-child]:mr-2",
        ],
      },
      size: {
        small: "text-xs  h-7",
        medium: "text-sm h-9",
        large: "text-md  h-12",
      },
      round: {
        true: "",
        false: "",
      },
      disabled: {
        true: "pointer-events-none",
      },
    },
    compoundVariants: [
      {
        size: "small",
        round: false,
        className: "px-3",
      },
      {
        size: "small",
        round: true,
        className: "w-7",
      },
      {
        size: "medium",
        round: false,
        className: "px-4",
      },
      {
        size: "medium",
        round: true,
        className: "w-9",
      },
      {
        size: "large",
        round: false,
        className: "px-6",
      },
      {
        size: "large",
        round: true,
        className: "w-12",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "medium",
      round: false,
    },
  }
);

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <span className={clsx("highlight", className)}>{children}</span>;

export const Button = ({
  children,
  variant,
  size,
  round,
  disabled,
  ...props
}: ButtonProps) => {
  const classes = buttonClasses({
    variant,
    size,
    round,
    disabled,
    className: props.className,
  });
  const { containerRef, isPressed } = useIsPressed();

  if ("href" in props && props.href !== undefined) {
    return (
      <Link {...props} ref={containerRef} className={classes}>
        {children}
        <TouchResponse
          className={""}
          borderClassName={""}
          isPressed={isPressed}
        />
      </Link>
    );
  }

  return (
    <div className={clsx('relative rounded-full')}>
      <button {...props} ref={containerRef} className={classes}>
        {children}
      </button>
      <TouchResponse
        className={"rounded-full"}
        isPressed={!disabled && isPressed}
      />
    </div>
  );
};
