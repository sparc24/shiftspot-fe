import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const LandingPage = lazy(() =>
  import('@/features/landing').then((module) => ({ default: module.LandingPage })),
)
const WorkerRegistrationPage = lazy(() =>
  import('@/features/worker-registration').then((module) => ({
    default: module.WorkerRegistrationPage,
  })),
)

function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-500">Loading…</p>
    </div>
  )
}

export function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/worker/register" element={<WorkerRegistrationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
