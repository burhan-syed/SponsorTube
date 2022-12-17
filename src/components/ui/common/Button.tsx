import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import TouchResponse from "./TouchResponse";
import useIsPressed from "@/hooks/useIsPressed";

const button = cva("relative outline-none", {
  variants: {
    intent: {
      primary: [
        // "bg-blue-500",
        // "",
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
  },
  compoundVariants: [
    { intent: "primary", size: "medium", className: "uppercase" },
  ],
  defaultVariants: {
    // intent: "primary",
    // size: "medium",
  },
});

export interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button: React.FC<ButtonProps> = ({
  className,
  intent,
  size,
  children,
  ...props
}) => {
  const { containerRef, isPressed } = useIsPressed();
  return (
    <button
      ref={containerRef}
      className={button({ intent, size, className })}
      {...props}
    >
      {children}
      <TouchResponse
        className={className}
        isPressed={isPressed}
      />
    </button>
  );
};
