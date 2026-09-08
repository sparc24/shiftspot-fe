import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { ContactRowView } from '../types'
import { WorkerContactPanel } from './WorkerContactPanel'

function createRow(overrides: Partial<ContactRowView> = {}): ContactRowView {
  return { value: '+91-900-000-0001', href: 'tel:+919000000001', ...overrides }
}

describe('WorkerContactPanel', () => {
  it('WorkerContactPanel_withPhoneAndEmailRows_rendersBothContactRows', () => {
    render(
      <WorkerContactPanel
        phone={createRow()}
        email={createRow({ value: 'anita.kumar@example.com', href: 'mailto:anita.kumar@example.com' })}
        contactHref="mailto:anita.kumar@example.com"
        workerName="Anita Kumar"
      />,
    )

    expect(screen.getByText('+91-900-000-0001')).toBeInTheDocument()
    expect(screen.getByText('anita.kumar@example.com')).toBeInTheDocument()
  })

  it('WorkerContactPanel_withContactHref_rendersAMailtoCtaLinkWithAccessibleName', () => {
    render(
      <WorkerContactPanel
        phone={createRow()}
        email={createRow({ value: 'anita.kumar@example.com', href: 'mailto:anita.kumar@example.com' })}
        contactHref="mailto:anita.kumar@example.com"
        workerName="Anita Kumar"
      />,
    )

    const cta = screen.getByRole('link', { name: 'Contact Anita Kumar by email' })
    expect(cta).toHaveAttribute('href', 'mailto:anita.kumar@example.com')
  })

  it('WorkerContactPanel_withoutContactHref_rendersADisabledButtonInsteadOfTheCtaLink', () => {
    render(
      <WorkerContactPanel
        phone={createRow()}
        email={createRow({ value: '', href: '' })}
        contactHref={undefined}
        workerName="Anita Kumar"
      />,
    )

    const button = screen.getByRole('button', { name: 'Contact Worker' })
    expect(button).toBeDisabled()
    expect(screen.queryByRole('link', { name: /contact .* by email/i })).not.toBeInTheDocument()
  })

  it('WorkerContactPanel_withoutContactHref_rendersAnSrOnlyHintExplainingWhy', () => {
    render(
      <WorkerContactPanel
        phone={createRow()}
        email={createRow({ value: '', href: '' })}
        contactHref={undefined}
        workerName="Anita Kumar"
      />,
    )

    expect(
      screen.getByText('This worker has not provided an email address.'),
    ).toBeInTheDocument()
  })

  it('WorkerContactPanel_withBlankEmailValue_rendersNotProvidedInsteadOfAContactRowLink', () => {
    render(
      <WorkerContactPanel
        phone={createRow()}
        email={createRow({ value: '   ', href: 'mailto:' })}
        contactHref={undefined}
        workerName="Anita Kumar"
      />,
    )

    expect(screen.getByText('Not provided')).toBeInTheDocument()
  })
})
