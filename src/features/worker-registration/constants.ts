import type { SkillOption } from '@/shared/types'

export const SKILL_OPTIONS: readonly SkillOption[] = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'retail', label: 'Retail' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'security', label: 'Security' },
] as const

export interface LocationOption {
  readonly value: string
  readonly label: string
}

export const LOCATION_OPTIONS: readonly LocationOption[] = [
  { value: 'downtown', label: 'Downtown' },
  { value: 'north-side', label: 'North Side' },
  { value: 'south-side', label: 'South Side' },
  { value: 'east-end', label: 'East End' },
  { value: 'west-end', label: 'West End' },
] as const

export const MIN_WORKER_AGE = 18
export const MAX_WORKER_AGE = 70
