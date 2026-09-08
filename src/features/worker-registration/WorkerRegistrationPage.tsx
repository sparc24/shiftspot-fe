import { SiteHeader, SuccessMessage } from "@/shared/components";
import { useWorkerRegistration } from "@/shared/hooks";
import type { WorkerRegistrationFormValues } from "@/shared/validation";

import { WorkerRegistrationForm } from "./WorkerRegistrationForm";

export function WorkerRegistrationPage() {
  const mutation = useWorkerRegistration();

  function handleSubmit(values: WorkerRegistrationFormValues) {
    mutation.mutate(values);
  }

  const bannerMessage = mutation.isError
    ? mutation.error.fieldErrors &&
      Object.keys(mutation.error.fieldErrors).length > 0
      ? mutation.error.message
      : "Registration failed. Please try again."
    : null;

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader
        current="worker"
        backTo="/"
        backLabel="Back to role selection"
      />

      <main className="page-container py-10 sm:py-14">
        {mutation.isSuccess ? (
          <div className="mx-auto max-w-2xl">
            <p className="eyebrow text-green-700">Profile published</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950">
              You&apos;re ready to be found.
            </h1>
            <SuccessMessage
              title="Registration complete"
              description={`Thanks, ${mutation.data.name}! Your worker profile has been created.`}
            />
          </div>
        ) : (
          <>
            <p className="eyebrow">Worker profile</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              List your skills
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
              Fill in your details so job seekers nearby can find you and reach
              out directly. All fields are required.
            </p>

            {bannerMessage ? (
              <div
                role="alert"
                className="mt-8 rounded-xl border-l-4 border-red-600 bg-red-50 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-700 text-sm font-bold text-white"
                  >
                    !
                  </span>
                  <div>
                    <p className="font-bold text-red-900">
                      We couldn&apos;t submit your profile
                    </p>
                    <p className="mt-1 text-sm leading-6 text-red-800">
                      {bannerMessage}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
              <div className="surface p-6 sm:p-8">
                <div className="mb-8 border-b border-gray-200 pb-5">
                  <h2 className="text-xl font-bold text-slate-950">
                    Your details
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    A few essentials help the right people reach you.
                  </p>
                </div>
                <WorkerRegistrationForm
                  onSubmit={handleSubmit}
                  isSubmitting={mutation.isPending}
                  serverFieldErrors={
                    mutation.isError ? mutation.error.fieldErrors : undefined
                  }
                />
              </div>

              <aside className="surface-muted h-fit p-6 lg:sticky lg:top-24">
                <p className="eyebrow text-amber-700">Simple by design</p>
                <h2 className="mt-3 text-xl font-bold text-gray-900">
                  Why we ask this
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  ShiftSpot is a direct-contact directory — there&apos;s no
                  login. Your email and phone are shown only to job seekers who
                  view your profile.
                </p>
                <ul className="mt-5 space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-600">01</span>
                    <span>Email and phone must be unique.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-600">02</span>
                    <span>Pick every skill that applies.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-600">03</span>
                    <span>You can be listed within seconds.</span>
                  </li>
                </ul>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
