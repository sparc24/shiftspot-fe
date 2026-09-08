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
