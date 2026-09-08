import type { WorkerCardView } from '../types'
import { WorkerCard } from './WorkerCard'

interface WorkerResultsGridProps {
  workers: readonly WorkerCardView[]
}

export function WorkerResultsGrid({ workers }: WorkerResultsGridProps) {
  return (
    <div role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {workers.map((worker) => (
        <WorkerCard key={worker.id} worker={worker} />
      ))}
    </div>
  )
}
