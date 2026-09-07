import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: ReadonlyArray<SelectOption>
  invalid?: boolean
  placeholder?: string
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput(
  { options, invalid = false, placeholder, className = '', ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid}
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 ${
        invalid ? 'border-red-500' : 'border-gray-300'
      } ${className}`}
      {...rest}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
})
