import { z } from 'zod'

import { SKILL_IDS } from '@/shared/types'

import { MAX_SEARCH_AGE, MIN_SEARCH_AGE } from './constants'

// Feature-local because this filter form is used by nothing outside
// job-seeker (unlike workerRegistrationSchema, which the shared layer owns).
export const workerSearchFilterSchema = z.object({
  // No .min(1) — unlike registration, zero skills is a valid search.
  skills: z.array(z.enum(SKILL_IDS)),

  location: z.string().trim().max(80, 'Location must be 80 characters or fewer'),

  // Kept as a string so an empty box is "no filter", not NaN.
  age: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d+$/.test(v), 'Enter age as a whole number')
    .refine(
      (v) => v === '' || (Number(v) >= MIN_SEARCH_AGE && Number(v) <= MAX_SEARCH_AGE),
      `Enter an age between ${MIN_SEARCH_AGE} and ${MAX_SEARCH_AGE}`,
    ),
})

export type WorkerSearchFormValues = z.infer<typeof workerSearchFilterSchema>
