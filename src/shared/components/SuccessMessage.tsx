import type { ReactNode } from "react";

interface SuccessMessageProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function SuccessMessage({
  title,
  description,
  children,
}: SuccessMessageProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm"
    >
      <div className="flex gap-4">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white"
        >
          ✓
        </span>
        <div>
          <h2 className="text-lg font-bold text-green-900">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-green-800">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
