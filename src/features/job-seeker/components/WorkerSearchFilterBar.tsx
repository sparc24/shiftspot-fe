import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button, FormField, MultiSelect, TextInput } from '@/shared/components'
import { SKILL_OPTIONS, type WorkerSearchFilters } from '@/shared/types'

import { toSearchFilters } from '../mappers'
import type { WorkerSearchFormValues } from '../types'
import { workerSearchFilterSchema } from '../validation'

interface WorkerSearchFilterBarProps {
  /** Called with validated, normalised filters when "Find Workers" is submitted. */
  onSearch: (filters: WorkerSearchFilters) => void
  /** Drives the Button's isLoading/aria-busy state. */
  isSearching: boolean
}

export function WorkerSearchFilterBar({ onSearch, isSearching }: WorkerSearchFilterBarProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkerSearchFormValues>({
    resolver: zodResolver(workerSearchFilterSchema),
    defaultValues: {
      skills: [],
      location: '',
      age: '',
    },
  })

  function onSubmit(values: WorkerSearchFormValues) {
    onSearch(toSearchFilters(values))
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Worker search filters"
      className="flex flex-col gap-4 rounded-lg border border-brand-border bg-white p-5 shadow-sm lg:flex-row lg:items-end"
    >
      <div className="lg:flex-1">
        <Controller
          name="skills"
          control={control}
          render={({ field }) => (
            <FormField id="skills" label="Skills" error={errors.skills?.message}>
              <MultiSelect
                id="skills"
                name="skills"
                options={SKILL_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                invalid={!!errors.skills}
                required={false}
                describedById={errors.skills ? 'skills-error' : undefined}
              />
            </FormField>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:w-96 lg:shrink-0">
        <FormField id="location" label="Location" error={errors.location?.message}>
          <TextInput
            id="location"
            placeholder="City, Country"
            invalid={!!errors.location}
            aria-describedby={errors.location ? 'location-error' : undefined}
            {...register('location')}
          />
        </FormField>

        <FormField id="age" label="Age" error={errors.age?.message}>
          <TextInput
            id="age"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="30"
            invalid={!!errors.age}
            aria-describedby={errors.age ? 'age-error' : undefined}
            {...register('age')}
          />
        </FormField>
      </div>

      <Button type="submit" variant="dark" isLoading={isSearching} className="w-full lg:w-auto">
        Find Workers
      </Button>
    </form>
  )
}
