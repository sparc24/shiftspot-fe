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
      <div className="mx-auto max-w-md text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-amber-bg text-brand-amber"
        >
          <SearchIcon />
        </span>
        <p className="mt-4 font-serif text-lg font-bold text-brand-navy">No workers found</p>
        <p className="mt-2 text-sm text-brand-muted">{SEARCH_EMPTY_MESSAGE}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-brand-border bg-white p-6 text-center shadow-sm">
      <p className="text-sm text-brand-muted">{MESSAGE_BY_VARIANT[variant]}</p>
    </div>
  )
}
