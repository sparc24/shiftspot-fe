import { Link } from 'react-router-dom'

export function JobSeekerSearchPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Search for workers</h1>
      <p className="text-base text-gray-600">
        Coming soon — job seeker search isn&apos;t built yet.
      </p>
      <Link to="/" className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline">
        ← Back to home
      </Link>
    </main>
  )
}
