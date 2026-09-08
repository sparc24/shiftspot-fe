export const SKILL_IDS = [
  'plumbing',
  'electrical',
  'gardening',
  'carpentry',
  'painting',
  'cleaning',
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

// Fields that can be independently flagged as duplicates by the mock API —
// email and phone are checked against separate uniqueness indexes, and either
// or both may be duplicated on the same submission.
export type DuplicateField = 'email' | 'phone'

export interface ApiError {
  code: string
  message: string
  field?: keyof WorkerRegistrationPayload
  /** Per-field messages for every duplicated field, so the caller can `setError` each one individually. */
  fieldErrors?: Partial<Record<DuplicateField, string>>
}
