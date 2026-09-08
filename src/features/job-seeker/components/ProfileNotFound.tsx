import { Link } from 'react-router-dom'

import { BACK_TO_SEARCH_LABEL, PROFILE_NOT_FOUND_DESCRIPTION, PROFILE_NOT_FOUND_TITLE } from '../constants'

interface ProfileNotFoundProps {
  title?: string
  description?: string
}

// Re-implements (does not import) the amber warning-panel markup used by
// WorkerRegistrationPage's duplicate banner — cross-feature internal imports
// are not allowed (Rule 4).
export function ProfileNotFound({
  title = PROFILE_NOT_FOUND_TITLE,
  description = PROFILE_NOT_FOUND_DESCRIPTION,
}: ProfileNotFoundProps) {
  return (
    <div
      role="alert"
      className="relative mx-auto max-w-xl overflow-hidden rounded-[10px] bg-brand-amber-bg p-4 pl-5"
    >
      <span aria-hidden="true" className="absolute inset-y-4 left-0 w-1 rounded-full bg-brand-amber" />
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-amber text-sm font-bold text-white"
        >
          !
        </span>
        <div>
          <h1 className="font-serif text-lg font-bold text-brand-navy">{title}</h1>
          <p className="mt-1 text-sm text-brand-muted">{description}</p>
          <Link
            to="/seeker/search"
            className="mt-3 inline-block rounded-sm py-1 text-sm font-medium text-brand-muted hover:text-brand-navy hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-navy"
          >
            <span aria-hidden="true">← </span>
            {BACK_TO_SEARCH_LABEL}
          </Link>
        </div>
      </div>
    </div>
  )
}
