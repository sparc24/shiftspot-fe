import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Button, FormField, MultiSelect, TextInput } from '@/shared/components'
import type { DuplicateField } from '@/shared/types'
import { workerRegistrationSchema, type WorkerRegistrationFormValues } from '@/shared/validation'

import { SKILL_OPTIONS } from './constants'

interface WorkerRegistrationFormProps {
  onSubmit: (values: WorkerRegistrationFormValues) => void
  isSubmitting: boolean
  /** Duplicate-field messages returned by the API for the most recent submission, if any. */
  serverFieldErrors?: Partial<Record<DuplicateField, string>>
}

export function WorkerRegistrationForm({
  onSubmit,
  isSubmitting,
  serverFieldErrors,
}: WorkerRegistrationFormProps) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<WorkerRegistrationFormValues>({
    resolver: zodResolver(workerRegistrationSchema),
    shouldFocusError: true,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      location: '',
      age: undefined,
      skills: [],
    },
  })

  // Duplicate-email/phone errors are discovered only after the mock API
  // responds, so they arrive as a prop rather than through the resolver —
  // apply each one to its own field, in addition to the top-level banner the
  // page renders.
  useEffect(() => {
    if (!serverFieldErrors) return
    for (const [fieldName, message] of Object.entries(serverFieldErrors) as Array<
      [DuplicateField, string]
    >) {
      setError(fieldName, { type: 'server', message })
    }
  }, [serverFieldErrors, setError])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FormField id="name" label="Name" required error={errors.name?.message}>
        <TextInput
          id="name"
          placeholder="e.g. John Doe"
          invalid={!!errors.name}
          aria-required="true"
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
      </FormField>

      <FormField
        id="email"
        label="Email ID"
        required
        error={errors.email?.message}
        hint="Used by job seekers to contact you — must be unique on ShiftSpot."
      >
        <TextInput
          id="email"
          type="email"
          placeholder="name@example.com"
          invalid={!!errors.email}
          aria-required="true"
          aria-describedby={errors.email ? 'email-error' : 'email-hint'}
          {...register('email')}
        />
      </FormField>

      <FormField id="phone" label="Phone Number" required error={errors.phone?.message}>
        <TextInput
          id="phone"
          type="tel"
          placeholder="9876543210"
          invalid={!!errors.phone}
          aria-required="true"
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          {...register('phone')}
        />
      </FormField>

      <FormField id="location" label="Location" required error={errors.location?.message}>
        <TextInput
          id="location"
          placeholder="City, Country"
          invalid={!!errors.location}
          aria-required="true"
          aria-describedby={errors.location ? 'location-error' : undefined}
          {...register('location')}
        />
      </FormField>

      <FormField id="age" label="Age" required error={errors.age?.message}>
        <TextInput
          id="age"
          type="number"
          placeholder="30"
          invalid={!!errors.age}
          aria-required="true"
          aria-describedby={errors.age ? 'age-error' : undefined}
          {...register('age')}
        />
      </FormField>

      <Controller
        name="skills"
        control={control}
        render={({ field }) => (
          <FormField
            id="skills"
            label={
              <>
                Skills
                <span aria-hidden="true" className="text-red-600">
                  {' '}
                  *
                </span>{' '}
                — select at least one
              </>
            }
            error={errors.skills?.message}
          >
            <MultiSelect
              id="skills"
              name="skills"
              options={SKILL_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              invalid={!!errors.skills}
              describedById={errors.skills ? 'skills-error' : undefined}
            />
          </FormField>
        )}
      />

      <div className="mt-2 flex flex-col items-stretch gap-3">
        <Button type="submit" variant="dark" isLoading={isSubmitting} className="w-full">
          Submit Profile
        </Button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm font-medium text-brand-muted hover:text-brand-navy hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
