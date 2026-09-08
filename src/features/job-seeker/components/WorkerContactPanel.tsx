import type { ReactNode } from 'react'

import { Button } from '@/shared/components'

import { CONTACT_UNAVAILABLE_HINT, CONTACT_WORKER_LABEL } from '../constants'
import type { ContactRowView } from '../types'
import { ContactRow } from './ContactRow'
import { MailIcon, PhoneIcon } from './ContactIcons'

interface WorkerContactPanelProps {
  phone: ContactRowView
  email: ContactRowView
  /** mailto href for the primary CTA; undefined renders the disabled Button. */
  contactHref?: string
  /** Used in the CTA's accessible name: "Contact Anita Kumar by email". */
  workerName: string
}

// Worker.phone/email are non-optional today, so a blank value is not
// reachable via the type system — this guard is defensive (plan §10.2 / Q20),
// kept so the disabled-CTA state SLPTWM-127 asks for is actually testable.
function ContactValueRow(props: { label: string; row: ContactRowView; icon: ReactNode }) {
  if (!props.row.value.trim()) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-white px-4 py-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-border text-brand-muted"
        >
          {props.icon}
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-brand-muted">{props.label}</span>
          <span className="block text-sm font-medium text-brand-muted">Not provided</span>
        </span>
      </div>
    )
  }

  return <ContactRow label={props.label} value={props.row.value} href={props.row.href} icon={props.icon} />
}

export function WorkerContactPanel({ phone, email, contactHref, workerName }: WorkerContactPanelProps) {
  return (
    <section aria-labelledby="contact-heading" className="mt-8 flex flex-col gap-4">
      <h2 id="contact-heading" className="font-serif text-lg font-bold text-brand-navy">
        Contact
      </h2>

      <div className="flex flex-col gap-3">
        <ContactValueRow label="Phone" row={phone} icon={<PhoneIcon />} />
        <ContactValueRow label="Email" row={email} icon={<MailIcon />} />
      </div>

      {contactHref ? (
        <a
          href={contactHref}
          aria-label={`Contact ${workerName} by email`}
          className="inline-flex w-fit items-center justify-center rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-navy active:bg-brand-navy/80"
        >
          {CONTACT_WORKER_LABEL}
        </a>
      ) : (
        <div>
          <Button variant="dark" disabled aria-disabled="true">
            {CONTACT_WORKER_LABEL}
          </Button>
          <span className="sr-only">{CONTACT_UNAVAILABLE_HINT}</span>
        </div>
      )}
    </section>
  )
}
