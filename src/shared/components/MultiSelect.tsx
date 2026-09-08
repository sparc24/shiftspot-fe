import type { SkillId, SkillOption } from '@/shared/types'

interface MultiSelectProps {
  id: string
  name: string
  options: readonly SkillOption[]
  value: SkillId[]
  onChange: (value: SkillId[]) => void
  invalid?: boolean
  describedById?: string
  /**
   * Drives `aria-required`. Defaults to `true` so worker-registration (where
   * selecting a skill is mandatory) is unaffected; job-seeker search passes
   * `false` because zero skills is a valid search.
   */
  required?: boolean
}

// Note: the accessible name for this group comes from the `<label id={`${id}-label`}>`
// rendered by the calling FormField (see WorkerRegistrationForm), referenced here via
// aria-labelledby — there is no `<legend>` here to avoid double-naming the same group
// for assistive tech (fieldset is not a "labelable element", so a plain `htmlFor` on
// that label wouldn't associate it; aria-labelledby is the correct association).
export function MultiSelect({
  id,
  name,
  options,
  value,
  onChange,
  invalid = false,
  describedById,
  required = true,
}: MultiSelectProps) {
  function handleToggle(skillId: SkillId, checked: boolean) {
    if (checked) {
      onChange([...value, skillId])
      return
    }
    onChange(value.filter((existing) => existing !== skillId))
  }

  return (
    <fieldset
      id={id}
      aria-invalid={invalid}
      aria-required={required}
      aria-labelledby={`${id}-label`}
      aria-describedby={describedById}
      className={`rounded-lg border p-3 ${invalid ? 'border-red-500' : 'border-brand-border'}`}
    >
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const optionId = `${name}-${option.value}`
          const checked = value.includes(option.value)
          return (
            <div key={option.value} className="relative">
              <input
                id={optionId}
                type="checkbox"
                name={name}
                value={option.value}
                checked={checked}
                onChange={(event) => handleToggle(option.value, event.target.checked)}
                className="peer sr-only"
              />
              <label
                htmlFor={optionId}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-brand-navy peer-active:bg-brand-amber-bg/70 ${
                  checked
                    ? 'border-2 border-brand-amber-dark bg-brand-amber-bg text-brand-navy'
                    : 'border-brand-border bg-white text-brand-muted hover:border-brand-amber-dark'
                }`}
              >
                {checked ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 shrink-0 fill-brand-amber-dark"
                  >
                    <path d="M6.4 11.2 3.2 8l1.13-1.13L6.4 8.93l5.27-5.27L12.8 4.8z" />
                  </svg>
                ) : null}
                {option.label}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
