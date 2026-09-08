interface SkillChipListProps {
  labels: readonly string[]
  /** Accessible name for the list, e.g. "Skills". */
  ariaLabel?: string
  /** Chip size — 'sm' for the search card, 'md' for the profile header. */
  size?: 'sm' | 'md'
}

const SIZE_CLASSES: Record<NonNullable<SkillChipListProps['size']>, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-3.5 py-1.5 text-sm',
}

// role="list" is explicit because Tailwind's `list-none` strips list
// semantics in Safari/VoiceOver.
export function SkillChipList({ labels, ariaLabel = 'Skills', size = 'sm' }: SkillChipListProps) {
  if (labels.length === 0) return null

  return (
    <ul role="list" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <li
          key={label}
          className={`inline-flex items-center rounded-full bg-brand-amber-bg font-semibold text-brand-navy ${SIZE_CLASSES[size]}`}
        >
          {label}
        </li>
      ))}
    </ul>
  )
}
