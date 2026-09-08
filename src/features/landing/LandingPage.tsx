import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components'

function CardCornerAccent() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-0 top-0 h-0 w-0 border-l-[18px] border-t-[18px] border-l-transparent border-t-brand-border"
    />
  )
}

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      <header className="flex items-center justify-between border-b border-brand-border bg-white px-6 py-4">
        <span className="flex items-center gap-2 font-serif text-lg font-bold text-brand-navy">
          <span aria-hidden="true" className="inline-block h-4 w-3 bg-brand-navy" />
          ShiftSpot
        </span>
        <span className="rounded-full border border-brand-amber bg-brand-amber-bg px-3 py-1.5 text-xs font-semibold text-brand-navy">
          Job Portal · PoC
        </span>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <h1 className="font-serif text-4xl font-bold text-brand-navy">
          Find local skilled workers. Get hired directly.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-brand-muted">
          ShiftSpot connects tradespeople with people who need work done nearby — plumbing, electrical,
          gardening, carpentry, painting, cleaning. No accounts, no middlemen.
        </p>
        <p className="mt-3 flex items-center gap-2 text-sm text-brand-navy">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
          No sign-in needed — pick a role below to get started.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-lg border border-brand-border bg-white p-6 shadow-sm">
            <CardCornerAccent />
            <p className="text-xs font-bold uppercase tracking-wide text-brand-amber">For workers</p>
            <h2 className="mt-1 font-serif text-xl font-bold text-brand-navy">List your skills</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Add your contact details, location, and trades so job seekers nearby can find and call you
              directly.
            </p>
            <Button
              variant="dark"
              onClick={() => navigate('/worker/register')}
              className="mt-5 w-full"
            >
              Act as a Worker
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-brand-border bg-white p-6 shadow-sm">
            <CardCornerAccent />
            <p className="text-xs font-bold uppercase tracking-wide text-brand-amber">
              For job seekers
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-brand-navy">Search for workers</h2>
            <p className="mt-2 text-sm text-brand-muted">
              Filter by skill, location, and age to find the right person, then reach out with their
              phone or email.
            </p>
            <Button
              variant="outline-dark"
              onClick={() => navigate('/seeker/search')}
              className="mt-5 w-full"
            >
              Act as a Job Seeker
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-brand-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <span>ShiftSpot Marketplace Launch — Job Portal PoC v1.0</span>
          <span>No login required</span>
        </div>
      </footer>
    </div>
  )
}
