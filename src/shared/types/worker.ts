export const SKILL_IDS = [
  'cleaning',
  'delivery',
  'kitchen',
  'retail',
  'warehouse',
  'security',
] as const

export type SkillId = (typeof SKILL_IDS)[number]

export interface SkillOption {
  readonly value: SkillId
  readonly label: string
}

export interface WorkerRegistrationPayload {
  name: string
  email: string
  phone: string
  location: string
  age: number
  skills: SkillId[]
}

export interface Worker extends WorkerRegistrationPayload {
  id: string
  createdAt: string
}

export interface ApiError {
  code: string
  message: string
  field?: keyof WorkerRegistrationPayload
}
