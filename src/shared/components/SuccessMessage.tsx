import type { ReactNode } from 'react'

interface SuccessMessageProps {
  title: string
  description?: string
  children?: ReactNode
}

export function SuccessMessage({ title, description, children }: SuccessMessageProps) {
  return (
    <div role="status" aria-live="polite" className="rounded-md border border-green-300 bg-green-50 p-4">
      <h2 className="text-base font-semibold text-green-800">{title}</h2>
      {description ? <p className="mt-1 text-sm text-green-700">{description}</p> : null}
      {children}
    </div>
  )
}
