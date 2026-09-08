import type { WorkerSearchFilters } from '@/shared/types'

export interface WorkerCardView {
  id: string
  /** 1–2 uppercase letters derived from the worker's name. */
  initials: string
  name: string
  location: string
  /** At most MAX_CARD_SKILLS (2) human-readable skill labels. */
  skillLabels: readonly string[]
}

export type SearchMessageVariant = 'idle' | 'loading' | 'empty'

export interface WorkerSearchFormValues {
  skills: WorkerSearchFilters['skills']
  location: string
  age: string
}

export interface ContactRowView {
  /** Human-readable value as stored, e.g. "+91-900-000-0001". */
  value: string
  /** Protocol href — `tel:` (digits and a leading + only) or `mailto:`. */
  href: string
}

export interface WorkerProfileView {
  id: string
  /** 1–2 uppercase letters, same derivation as WorkerCardView. */
  initials: string
  name: string
  location: string
  age: number
  /** Pre-formatted, e.g. "Age 29" — keeps formatting out of JSX. */
  ageLabel: string
  /** ALL skill labels — unlike WorkerCardView, never sliced to MAX_CARD_SKILLS. */
  skillLabels: readonly string[]
  phone: ContactRowView
  email: ContactRowView
}
