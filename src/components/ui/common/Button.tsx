import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import TouchResponse from "./TouchResponse";
import useIsPressed from "@/hooks/useIsPressed";

const button = cva(
  "relative outline-none transition-all flex items-center justify-center",
  {
    variants: {
      intent: {
        primary: [
          "bg-th-chipBackground hover:bg-th-chipBackgroundHover",
          "border border-transparent hover:border-th-chipBackground",
          // "border-transparent",
          // "hover:bg-blue-600",
        ],
        secondary: [
          // "bg-white",
          // "text-gray-800",
          // "border-gray-400",
          // "hover:bg-gray-100",
        ],
      },
      size: {
        small: ["text-sm", "py-1", "px-2"],
        medium: ["text-base", "py-2", "px-4"],
      },
      shape: {
        round: ["rounded-full"],
      },
    },
    compoundVariants: [
      { intent: "primary", size: "medium", className: "uppercase" },
    ],
    defaultVariants: {
      intent: "primary",
      shape: "round",
    },
  }
);

export interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  intent,
  size,
  children,
  disabled = false,
  ...props
}) => {
  const { containerRef, isPressed } = useIsPressed();
  return (
    <button
      disabled={disabled}
      ref={containerRef}
      className={button({ intent, size, className })}
      {...props}
    >
      {children}
      <TouchResponse
        className={className}
        borderClassName={className}
        isPressed={!disabled && isPressed}
      />
    </button>
  );
};
