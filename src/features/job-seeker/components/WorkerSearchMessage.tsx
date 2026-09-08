import { SEARCH_EMPTY_MESSAGE, SEARCH_IDLE_MESSAGE, SEARCH_LOADING_MESSAGE } from '../constants'
import type { SearchMessageVariant } from '../types'
import { SearchIcon } from './ContactIcons'

interface WorkerSearchMessageProps {
  variant: SearchMessageVariant
}

const MESSAGE_BY_VARIANT: Record<SearchMessageVariant, string> = {
  idle: SEARCH_IDLE_MESSAGE,
  loading: SEARCH_LOADING_MESSAGE,
  empty: SEARCH_EMPTY_MESSAGE,
}

// The zero-results variant gets the icon + heading treatment from the
// approved design; idle/loading have no equivalent Penpot reference, so
// they stay as plain centered text.
export function WorkerSearchMessage({ variant }: WorkerSearchMessageProps) {
  if (variant === 'empty') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-amber-bg text-brand-amber"
        >
          <SearchIcon className="h-7 w-7" />
        </span>
        <p className="text-xl font-semibold text-brand-navy">No workers found</p>
        <p className="text-base text-brand-muted">{SEARCH_EMPTY_MESSAGE}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-brand-border bg-white p-6 text-center shadow-sm">
      <p className="text-sm text-brand-muted">{MESSAGE_BY_VARIANT[variant]}</p>
    </div>
  )
}
