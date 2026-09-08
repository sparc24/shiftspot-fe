import { useNavigate } from "react-router-dom";

import { Button, SiteHeader } from "@/shared/components";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="site-shell flex min-h-screen flex-col">
      <SiteHeader />

      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden="true"
          className="soft-grid pointer-events-none absolute inset-x-0 top-0 h-[34rem]"
        />
        <div className="page-container relative py-14 sm:py-20 lg:py-24">
          <section className="max-w-4xl">
            <p className="eyebrow">The local skills marketplace</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">
              Find local skilled workers. Get hired directly.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              ShiftSpot connects tradespeople with people who need work done
              nearby - plumbing, electrical, gardening, carpentry, painting,
              cleaning. No accounts, no middlemen.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-green-600"
              />
              No sign-in needed - pick a role below to get started.
            </p>
          </section>

          <section
            className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2"
            aria-label="Choose your role"
          >
            <div className="surface group p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">For workers</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-950">
                    List your skills
                  </h2>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-xl text-blue-700"
                >
                  +
                </span>
              </div>
              <p className="mt-4 max-w-md leading-7 text-gray-600">
                Add your contact details, location, and trades so job seekers
                nearby can find and call you directly.
              </p>
              <Button
                variant="dark"
                onClick={() => navigate("/worker/register")}
                className="mt-7 w-full sm:w-auto"
              >
                Act as a Worker
              </Button>
            </div>

            <div className="surface group border-t-4 border-t-amber-500 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-amber-700">For job seekers</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-950">
                    Search for workers
                  </h2>
                </div>
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-xl text-amber-700"
                >
                  ⌕
                </span>
              </div>
              <p className="mt-4 max-w-md leading-7 text-gray-600">
                Filter by skill, location, and age to find the right person,
                then reach out with their phone or email.
              </p>
              <Button
                variant="outline-dark"
                onClick={() => navigate("/seeker/search")}
                className="mt-7 w-full sm:w-auto"
              >
                Act as a Job Seeker
              </Button>
            </div>
          </section>

          <section
            className="mt-16 grid gap-5 border-t border-gray-200 pt-8 sm:grid-cols-3"
            aria-label="Marketplace benefits"
          >
            <div>
              <p className="text-2xl font-extrabold text-slate-950">01</p>
              <h2 className="mt-2 font-bold text-slate-950">Choose a role</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Start as a skilled worker or someone looking for help.
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-950">02</p>
              <h2 className="mt-2 font-bold text-slate-950">
                Share what matters
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Keep profiles focused on skills, location, and direct contact.
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-950">03</p>
              <h2 className="mt-2 font-bold text-slate-950">
                Make the connection
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Skip the middleman and speak with the right person directly.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="page-container flex flex-col gap-1 py-5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>ShiftSpot Marketplace Launch - Job Portal PoC v1.0</span>
          <span>No login required</span>
        </div>
      </footer>
    </div>
  );
}
