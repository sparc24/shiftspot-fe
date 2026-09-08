import type { WorkerCardView } from '../types'

interface WorkerCardProps {
  worker: WorkerCardView
}

interface SkillBadgeProps {
  label: string
}

function SkillBadge({ label }: SkillBadgeProps) {
  return (
    <li className="inline-flex items-center rounded-full bg-brand-amber-bg px-3 py-1 text-xs font-semibold text-brand-navy">
      {label}
    </li>
  )
}

export function WorkerCard({ worker }: WorkerCardProps) {
  return (
    <div
      role="listitem"
      className="flex flex-col gap-3 rounded-lg border border-brand-border bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white"
        >
          {worker.initials}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-serif text-base font-bold text-brand-navy">{worker.name}</h3>
          <p className="truncate text-sm text-brand-muted">
            <span className="sr-only">Location: </span>
            {worker.location}
          </p>
        </div>
      </div>

      {worker.skillLabels.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          <span className="sr-only">Skills</span>
          {worker.skillLabels.map((label) => (
            <SkillBadge key={label} label={label} />
          ))}
        </ul>
      ) : null}
    </div>
  )
}
