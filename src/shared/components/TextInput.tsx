import { forwardRef, type InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ invalid = false, className = "", ...rest }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid}
        className={`w-full rounded-lg border px-4 py-3 text-base transition-colors placeholder:text-gray-400 focus:border-blue-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed ${
          invalid
            ? "border-red-500 bg-red-50"
            : "border-gray-300 bg-white hover:border-gray-400"
        } ${className}`}
        {...rest}
      />
    );
  },
);
