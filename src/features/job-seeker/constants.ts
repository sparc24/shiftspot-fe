// Verbatim copy — these strings are acceptance-criteria text and must not be
// paraphrased.
export const SEARCH_IDLE_MESSAGE =
  'Start by selecting a skill or location to find workers near you.' // AC4
export const SEARCH_EMPTY_MESSAGE =
  'No workers found matching your criteria. Try adjusting your filters.' // AC3
export const SEARCH_LOADING_MESSAGE = 'Searching for workers…'
export const SEARCH_ERROR_MESSAGE = "We couldn't load workers right now. Please try again."

export const MAX_CARD_SKILLS = 2

// Age bounds are inlined here rather than imported from worker-registration —
// a search range and a registration eligibility rule are different concerns
// that happen to share numbers today (plan §7.2 / Open Question Q13).
export const MIN_SEARCH_AGE = 18
export const MAX_SEARCH_AGE = 70

/** AC1: "2 workers found" — singular form for exactly one. */
export function formatResultCount(count: number): string {
  return `${count} ${count === 1 ? 'worker' : 'workers'} found`
}

/** AC3 — verbatim from the acceptance criterion. */
export const PROFILE_NOT_FOUND_TITLE = 'Profile Not Found'
export const PROFILE_NOT_FOUND_DESCRIPTION =
  'This worker profile is no longer available. It may have been removed, or the link may be out of date.'
export const PROFILE_LOADING_MESSAGE = 'Loading worker profile…'
export const PROFILE_ERROR_MESSAGE = "We couldn't load this profile right now. Please try again."
export const BACK_TO_SEARCH_LABEL = 'Back to search results'
export const CONTACT_WORKER_LABEL = 'Contact Worker'
export const CONTACT_UNAVAILABLE_HINT = 'This worker has not provided an email address.'
