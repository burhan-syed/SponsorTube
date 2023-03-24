import { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";
import TouchResponse from "./TouchResponse";
import useIsPressed from "@/hooks/useIsPressed";
import { useSession } from "next-auth/react";
import useGlobalStore from "@/store/useGlobalStore";
import { CgSpinnerTwoAlt } from "react-icons/cg";

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
  (ButtonAsAnchorProps | ButtonAsButtonProps) & {
    requireSession?: { required: boolean; reason?: string };
    dummyButton?: boolean;
  };

const buttonClasses = cva(
  "relative rounded-full inline-flex items-center justify-center transition-all ease-in-out select-none hover:shadow ",
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
        accent: [
          "border border-transparent bg-th-textPrimary text-th-textPrimaryInverse hover:border-th-chipBackground hover:shadow-md hover:ring-2 hover:ring-th-callToAction/50",
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
        true: "pointer-events-none opacity-50",
      },
      loading: {
        true: "text-transparent", //
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
  loading,
  dummyButton,
  requireSession = { required: false },
  ...props
}: ButtonProps) => {
  const classes = buttonClasses({
    variant,
    size,
    round,
    disabled,
    loading,
    className: props.className,
  });
  const { data: sessionData } = useSession();
  const setSessionRequiredTrigger = useGlobalStore(
    (state) => state.setSessionRequiredTrigger
  );
  const { containerRef, isPressed } = useIsPressed();

  if (dummyButton) {
    return (
      <div ref={containerRef} className={clsx(classes)}>
        {children}

        <TouchResponse
          variant="ring"
          className={"rounded-full"}
          isPressed={!disabled && isPressed}
        />
        {loading && (
          <mark
            className={clsx(
              "absolute bg-transparent",
              variant === "accent" && "text-th-textPrimaryInverse"
            )}
          >
            <CgSpinnerTwoAlt className="animate-spin" />
          </mark>
        )}
      </div>
    );
  }

  if ("href" in props && props.href !== undefined) {
    return (
      <Link {...props}>
        <span className={clsx(classes)} ref={containerRef}>
          {children}
          <TouchResponse isPressed={isPressed} className={"rounded-full"} />
        </span>
      </Link>
    );
  }

  return (
    <button
      {...props}
      disabled={!!disabled}
      ref={containerRef}
      className={clsx(classes)}
      onClick={(e) => {
        if (requireSession.required && !sessionData) {
          setSessionRequiredTrigger(requireSession?.reason);
          e.preventDefault();
          e.stopPropagation();
        } else if (props.onClick) {
          props.onClick(e);
        }
      }}
    >
      {children}

      <TouchResponse
        variant="ring"
        className={"rounded-full"}
        isPressed={!disabled && isPressed}
      />
      {loading && (
        <mark
          className={clsx(
            "absolute bg-transparent",
            variant === "accent" && "text-th-textPrimaryInverse"
          )}
        >
          <CgSpinnerTwoAlt className="animate-spin" />
        </mark>
      )}
    </button>
  );
};
