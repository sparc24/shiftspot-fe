import type { SkillOption } from '@/shared/types'

// Grid order matches the design: row 1 = Plumbing, Electrical, Gardening;
// row 2 = Carpentry, Painting, Cleaning.
export const SKILL_OPTIONS: readonly SkillOption[] = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'painting', label: 'Painting' },
  { value: 'cleaning', label: 'Cleaning' },
] as const

export const MIN_WORKER_AGE = 18
export const MAX_WORKER_AGE = 70
