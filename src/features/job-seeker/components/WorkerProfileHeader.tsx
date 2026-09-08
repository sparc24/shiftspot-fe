import type { WorkerProfileView } from '../types'
import { SkillChipList } from './SkillChipList'

interface WorkerProfileHeaderProps {
  /** Pre-mapped view model — the component performs no derivation. */
  profile: WorkerProfileView
}

export function WorkerProfileHeader({ profile }: WorkerProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xl font-bold text-white"
        >
          {profile.initials}
        </span>
        <div className="min-w-0">
          <h1 id="worker-profile-name" className="truncate font-serif text-2xl font-bold text-brand-navy">
            {profile.name}
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            <span className="sr-only">Location: </span>
            {profile.location}
            <span aria-hidden="true"> · </span>
            <span className="sr-only">Age: </span>
            {profile.ageLabel}
          </p>
        </div>
      </div>

      <SkillChipList labels={profile.skillLabels} ariaLabel="Skills" size="md" />
    </div>
  )
}
