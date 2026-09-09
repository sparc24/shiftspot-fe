import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { WorkerProfileView } from '../types'
import { WorkerProfileHeader } from './WorkerProfileHeader'

function createProfileView(overrides: Partial<WorkerProfileView> = {}): WorkerProfileView {
  return {
    id: 'worker-123',
    initials: 'AK',
    name: 'Anita Kumar',
    location: 'Cochin, Kerala',
    age: 29,
    ageLabel: 'Age 29',
    skillLabels: ['Plumbing', 'Electrical'],
    phone: { value: '+91-900-000-0001', href: 'tel:+919000000001' },
    email: { value: 'anita.kumar@example.com', href: 'mailto:anita.kumar@example.com' },
    ...overrides,
  }
}

describe('WorkerProfileHeader', () => {
  it('WorkerProfileHeader_withProfile_rendersNameLocationAgeAndInitials', () => {
    const profile = createProfileView()

    render(<WorkerProfileHeader profile={profile} />)

    const heading = screen.getByRole('heading', { name: 'Anita Kumar' })
    expect(heading).toBeInTheDocument()
    // Location/age share one <p> with sr-only label prefixes, so their text
    // nodes aren't isolated elements getByText can match directly.
    expect(heading.nextElementSibling).toHaveTextContent('Cochin, Kerala')
    expect(heading.nextElementSibling).toHaveTextContent('Age 29')
    expect(screen.getByText('AK')).toBeInTheDocument()
  })

  it('WorkerProfileHeader_withSkillLabels_rendersSkillsListWithAccessibleRoleAndLabel', () => {
    const profile = createProfileView({ skillLabels: ['Plumbing', 'Electrical'] })

    render(<WorkerProfileHeader profile={profile} />)

    const list = screen.getByRole('list', { name: 'Skills' })
    expect(list).toBeInTheDocument()
    expect(screen.getByText('Plumbing')).toBeInTheDocument()
    expect(screen.getByText('Electrical')).toBeInTheDocument()
  })

  // Penpot design-alignment regression guard (commit 128146e): the avatar
  // switched from navy to amber styling.
  it('WorkerProfileHeader_withProfile_rendersAvatarWithAmberStylingNotNavy', () => {
    const profile = createProfileView()

    render(<WorkerProfileHeader profile={profile} />)

    const avatar = screen.getByText('AK')
    expect(avatar).toHaveClass('bg-brand-amber-bg', 'text-brand-amber')
    expect(avatar).not.toHaveClass('bg-brand-navy', 'text-white')
  })
})
