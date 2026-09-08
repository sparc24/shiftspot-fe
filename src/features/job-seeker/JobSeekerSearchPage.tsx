import {
  SiteHeader,
  Button,
  SelectInput,
  TextInput,
} from "@/shared/components";

export function JobSeekerSearchPage() {
  return (
    <div className="site-shell min-h-screen">
      <SiteHeader current="seeker" backTo="/" backLabel="Back to home" />
      <main className="page-container py-12 sm:py-16">
        <section className="max-w-3xl">
          <p className="eyebrow text-amber-700">For job seekers</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Search for workers
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            Find trusted local skills for the work you need done. Search is
            being prepared for the first marketplace launch.
          </p>
        </section>

        <section
          className="surface mt-10 overflow-hidden"
          aria-labelledby="search-preview-title"
        >
          <div className="border-b border-gray-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2
                  id="search-preview-title"
                  className="text-xl font-bold text-slate-950"
                >
                  Build your search
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Choose the kind of help you need and where you need it.
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
                Coming soon
              </span>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
              <label className="text-sm font-bold text-gray-900">
                Skill or trade
                <TextInput
                  className="mt-2"
                  placeholder="e.g. plumber, painter"
                  disabled
                  aria-label="Skill or trade"
                />
              </label>
              <label className="text-sm font-bold text-gray-900">
                Location
                <SelectInput
                  className="mt-2"
                  aria-label="Location"
                  disabled
                  placeholder="Choose a location"
                  options={[]}
                />
              </label>
              <Button disabled className="w-full md:w-auto">
                Search workers
              </Button>
            </div>
          </div>
          <div className="grid gap-4 bg-gray-50 p-6 sm:grid-cols-2 sm:p-8">
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-5">
              <p className="text-sm font-bold text-slate-950">
                Profiles will show what you need
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Compare skills, location, and contact details in one clear
                profile.
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-5">
              <p className="text-sm font-bold text-slate-950">
                No account required
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                When search launches, you can contact workers directly without
                signing in.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-sm text-gray-500">
          Coming soon — job seeker search isn&apos;t built yet.
        </p>
      </main>
    </div>
  );
}
