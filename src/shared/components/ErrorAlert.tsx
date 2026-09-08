import { Button } from './Button'

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-4">
      <p className="text-sm text-red-800">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          Retry
        </Button>
      ) : null}
    </div>
  )
}
