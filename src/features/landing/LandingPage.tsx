import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">ShiftSpot Job Portal</h1>
      <p className="text-base text-gray-600">
        Find shift work near you, or register as a worker to get discovered by employers.
      </p>
      <Button onClick={() => navigate('/worker/register')}>Act as a Worker</Button>
    </main>
  )
}
