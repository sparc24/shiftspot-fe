import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ProfileNotFound } from './ProfileNotFound'

function renderNotFound(props: React.ComponentProps<typeof ProfileNotFound> = {}) {
  return render(
    <MemoryRouter>
      <ProfileNotFound {...props} />
    </MemoryRouter>,
  )
}

describe('ProfileNotFound', () => {
  it('ProfileNotFound_default_rendersAnAlertRoleWithTheExactTitle', () => {
    renderNotFound()

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Profile Not Found' })).toBeInTheDocument()
  })

  it('ProfileNotFound_default_containsABackToSearchResultsLink', () => {
    renderNotFound()

    expect(screen.getByRole('link', { name: /back to search results/i })).toHaveAttribute(
      'href',
      '/seeker/search',
    )
  })

  it('ProfileNotFound_withCustomTitleAndDescription_rendersTheOverridesInsteadOfDefaults', () => {
    renderNotFound({ title: 'Custom Title', description: 'Custom description.' })

    expect(screen.getByRole('heading', { name: 'Custom Title' })).toBeInTheDocument()
    expect(screen.getByText('Custom description.')).toBeInTheDocument()
  })
})
