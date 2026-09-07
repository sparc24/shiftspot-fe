import type { ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: ReactNode
}

// Note: the field control passed as `children` is responsible for setting
// `aria-describedby={`${id}-error`}`/`aria-invalid` itself (see
// WorkerRegistrationForm) — FormField owns the label/hint/error markup and
// the ids those attributes point at, so the two stay in sync by construction.
export function FormField({ id, label, error, required = false, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label id={`${id}-label`} htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-red-600">
            {' '}
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
