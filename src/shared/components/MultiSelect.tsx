import type { SkillId, SkillOption } from "@/shared/types";

interface MultiSelectProps {
  id: string;
  name: string;
  options: readonly SkillOption[];
  value: SkillId[];
  onChange: (value: SkillId[]) => void;
  invalid?: boolean;
  describedById?: string;
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
}: MultiSelectProps) {
  function handleToggle(skillId: SkillId, checked: boolean) {
    if (checked) {
      onChange([...value, skillId]);
      return;
    }
    onChange(value.filter((existing) => existing !== skillId));
  }

  return (
    <fieldset
      id={id}
      aria-invalid={invalid}
      aria-required="true"
      aria-labelledby={`${id}-label`}
      aria-describedby={describedById}
      className={`rounded-lg border bg-white p-3 ${invalid ? "border-red-500 bg-red-50" : "border-gray-300"}`}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          const checked = value.includes(option.value);
          return (
            <div
              key={option.value}
              className={`relative flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                checked
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-400"
              }`}
            >
              <span
                aria-hidden="true"
                className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full border border-gray-300 bg-gray-100"
              />
              <input
                id={optionId}
                type="checkbox"
                name={name}
                value={option.value}
                checked={checked}
                onChange={(event) =>
                  handleToggle(option.value, event.target.checked)
                }
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
              />
              <label
                htmlFor={optionId}
                className="text-sm font-semibold text-gray-800"
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
