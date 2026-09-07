import { z } from 'zod'

import { SKILL_IDS } from '@/shared/types'

export const workerRegistrationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{7,15}$/, 'Enter a valid phone number'),
  location: z.string().trim().min(1, 'Enter your location'),
  age: z.coerce
    .number()
    .int('Age must be a whole number')
    .min(18, 'You must be at least 18')
    .max(70, 'Age must be 70 or below'),
  skills: z.array(z.enum(SKILL_IDS)).min(1, 'Select at least one skill'),
})

export type WorkerRegistrationFormValues = z.infer<typeof workerRegistrationSchema>
