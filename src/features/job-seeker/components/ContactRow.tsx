import type { ReactNode } from 'react'

interface ContactRowProps {
  /** Visible field label, e.g. "Phone". */
  label: string
  /** Human-readable value shown to the user, e.g. "+91-900-000-0001". */
  value: string
  /** Normalised href — `tel:+919000000001` / `mailto:a@b.test`. */
  href: string
  /** Rendered inside the circular badge; must be aria-hidden. */
  icon: ReactNode
}

// One <a> wraps the whole row so there is a single tab stop; no aria-label
// override, so the visible label stays the accessible-name prefix (WCAG 2.5.3).
export function ContactRow({ label, value, href, icon }: ContactRowProps) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-navy active:bg-white/60"
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-amber-bg text-brand-amber"
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-brand-muted">{label}</span>
        <span className="block truncate text-sm font-medium text-brand-navy group-hover:underline group-hover:underline-offset-2">
          {value}
        </span>
      </span>
    </a>
  )
}
