import { forwardRef, type InputHTMLAttributes } from 'react'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { invalid = false, className = '', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm text-brand-navy placeholder:text-brand-muted focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-navy ${
        invalid ? 'border-red-400 bg-red-50' : 'border-brand-border bg-white'
      } ${className}`}
      {...rest}
    />
  )
})
