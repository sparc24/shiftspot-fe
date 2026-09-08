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
