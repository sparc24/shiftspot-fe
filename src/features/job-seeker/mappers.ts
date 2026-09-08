import type { SkillOption, Worker, WorkerSearchFilters } from '@/shared/types'
import { SKILL_OPTIONS } from '@/shared/types'

import { MAX_CARD_SKILLS } from './constants'
import type { WorkerCardView, WorkerSearchFormValues } from './types'

const SKILL_LABEL_BY_ID: Readonly<Record<string, string>> = SKILL_OPTIONS.reduce(
  (acc, option: SkillOption) => {
    acc[option.value] = option.label
    return acc
  },
  {} as Record<string, string>,
)

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
}

export function toWorkerCardView(worker: Worker): WorkerCardView {
  return {
    id: worker.id,
    initials: toInitials(worker.name),
    name: worker.name,
    location: worker.location,
    skillLabels: worker.skills
      .slice(0, MAX_CARD_SKILLS)
      .map((skillId) => SKILL_LABEL_BY_ID[skillId] ?? skillId),
  }
}

export function toSearchFilters(values: WorkerSearchFormValues): WorkerSearchFilters {
  return {
    skills: values.skills,
    ...(values.location.trim() ? { location: values.location.trim() } : {}),
    ...(values.age.trim() ? { age: Number(values.age) } : {}),
  }
}
