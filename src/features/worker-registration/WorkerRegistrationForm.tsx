import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button, FormField, MultiSelect, SelectInput, TextInput } from '@/shared/components'
import { workerRegistrationSchema, type WorkerRegistrationFormValues } from '@/shared/validation'

import { LOCATION_OPTIONS, SKILL_OPTIONS } from './constants'

interface WorkerRegistrationFormProps {
  onSubmit: (values: WorkerRegistrationFormValues) => void
  isSubmitting: boolean
}

export function WorkerRegistrationForm({ onSubmit, isSubmitting }: WorkerRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    control,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField id="name" label="Name" required error={errors.name?.message}>
        <TextInput
          id="name"
          invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
      </FormField>

      <FormField id="email" label="Email" required error={errors.email?.message}>
        <TextInput
          id="email"
          type="email"
          invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
      </FormField>

      <FormField id="phone" label="Phone" required error={errors.phone?.message}>
        <TextInput
          id="phone"
          type="tel"
          invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          {...register('phone')}
        />
      </FormField>

      <FormField id="location" label="Location" required error={errors.location?.message}>
        <SelectInput
          id="location"
          placeholder="Select a location"
          options={LOCATION_OPTIONS}
          invalid={!!errors.location}
          aria-describedby={errors.location ? 'location-error' : undefined}
          {...register('location')}
        />
      </FormField>

      <FormField id="age" label="Age" required error={errors.age?.message}>
        <TextInput
          id="age"
          type="number"
          invalid={!!errors.age}
          aria-describedby={errors.age ? 'age-error' : undefined}
          {...register('age')}
        />
      </FormField>

      <Controller
        name="skills"
        control={control}
        render={({ field }) => (
          <FormField id="skills" label="Skills" required error={errors.skills?.message}>
            <MultiSelect
              name="skills"
              legend="Skills"
              options={SKILL_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              invalid={!!errors.skills}
            />
          </FormField>
        )}
      />

      <Button type="submit" isLoading={isSubmitting} className="mt-2 self-start">
        Register
      </Button>
    </form>
  )
}
