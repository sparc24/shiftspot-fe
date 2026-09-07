import type { SkillId, SkillOption } from '@/shared/types'

interface MultiSelectProps {
  id: string
  name: string
  options: readonly SkillOption[]
  value: SkillId[]
  onChange: (value: SkillId[]) => void
  invalid?: boolean
  describedById?: string
}

// Note: the accessible name for this group comes from the `<label id={`${id}-label`}>`
// rendered by the calling FormField (see WorkerRegistrationForm), referenced here via
// aria-labelledby — there is no `<legend>` here to avoid double-naming the same group
// for assistive tech (fieldset is not a "labelable element", so a plain `htmlFor` on
// that label wouldn't associate it; aria-labelledby is the correct association).
export function MultiSelect({ id, name, options, value, onChange, invalid = false, describedById }: MultiSelectProps) {
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
      aria-required="true"
      aria-labelledby={`${id}-label`}
      aria-describedby={describedById}
      className={`rounded-md border p-3 ${invalid ? 'border-red-500' : 'border-gray-300'}`}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const optionId = `${name}-${option.value}`
          return (
            <div key={option.value} className="flex items-center gap-2">
              <input
                id={optionId}
                type="checkbox"
                name={name}
                value={option.value}
                checked={value.includes(option.value)}
                onChange={(event) => handleToggle(option.value, event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
              />
              <label htmlFor={optionId} className="text-sm text-gray-700">
                {option.label}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
