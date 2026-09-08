import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "outline-dark";
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md disabled:bg-gray-300 disabled:text-gray-600",
  secondary:
    "border border-blue-600 bg-white text-blue-700 hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-400",
  dark: "bg-slate-900 text-white shadow-sm hover:bg-blue-700 hover:shadow-md disabled:bg-gray-300 disabled:text-gray-600",
  "outline-dark":
    "border border-slate-900 bg-white text-slate-900 hover:border-blue-700 hover:bg-blue-50 hover:text-blue-700 disabled:border-gray-300 disabled:text-gray-400",
};

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
