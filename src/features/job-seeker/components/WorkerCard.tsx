import { Link } from 'react-router-dom'

import type { WorkerCardView } from '../types'
import { SkillChipList } from './SkillChipList'

interface WorkerCardProps {
  worker: WorkerCardView
}

// The whole card is one link so its surface is a single tab stop and the
// route is reachable at all (plan Q2). role="listitem" moves to this wrapper
// so the anchor's accessible name is the full card text.
export function WorkerCard({ worker }: WorkerCardProps) {
  return (
    <div role="listitem">
      <Link
        to={`/seeker/worker/${encodeURIComponent(worker.id)}`}
        className="notch-panel relative flex flex-col gap-3 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-navy active:shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-amber-bg text-sm font-semibold text-brand-amber"
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

        <SkillChipList labels={worker.skillLabels} ariaLabel="Skills" size="sm" />
      </Link>
    </div>
  )
}
