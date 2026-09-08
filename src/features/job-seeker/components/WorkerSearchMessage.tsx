import { SEARCH_EMPTY_MESSAGE, SEARCH_IDLE_MESSAGE, SEARCH_LOADING_MESSAGE } from '../constants'
import type { SearchMessageVariant } from '../types'

interface WorkerSearchMessageProps {
  variant: SearchMessageVariant
}

const MESSAGE_BY_VARIANT: Record<SearchMessageVariant, string> = {
  idle: SEARCH_IDLE_MESSAGE,
  loading: SEARCH_LOADING_MESSAGE,
  empty: SEARCH_EMPTY_MESSAGE,
}

export function WorkerSearchMessage({ variant }: WorkerSearchMessageProps) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-brand-border bg-white p-6 text-center shadow-sm">
      <p className="text-sm text-brand-muted">{MESSAGE_BY_VARIANT[variant]}</p>
    </div>
  )
}
