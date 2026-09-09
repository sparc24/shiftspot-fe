import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ContactRow } from './ContactRow'

describe('ContactRow', () => {
  it('ContactRow_withLabelAndValue_rendersBothAsVisibleText', () => {
    render(
      <ContactRow
        label="Phone"
        value="+91-900-000-0001"
        href="tel:+919000000001"
        icon={<span>icon</span>}
      />,
    )

    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('+91-900-000-0001')).toBeInTheDocument()
  })

  it('ContactRow_withHrefProp_rendersALinkWithExactlyThatHrefUnmodified', () => {
    render(
      <ContactRow
        label="Email"
        value="jane.doe@example.com"
        href="mailto:jane.doe@example.com"
        icon={<span>icon</span>}
      />,
    )

    expect(screen.getByRole('link')).toHaveAttribute('href', 'mailto:jane.doe@example.com')
  })

  it('ContactRow_withIcon_rendersTheIconInsideAnAriaHiddenBadge', () => {
    render(
      <ContactRow
        label="Phone"
        value="+91-900-000-0001"
        href="tel:+919000000001"
        icon={<span data-testid="row-icon">i</span>}
      />,
    )

    const icon = screen.getByTestId('row-icon')
    expect(icon.closest('[aria-hidden="true"]')).toBeInTheDocument()
  })

  // Penpot design-alignment regression guard (commit 128146e): the icon
  // badge switched from navy to amber styling.
  it('ContactRow_withIcon_rendersIconBadgeWithAmberStylingNotNavy', () => {
    render(
      <ContactRow
        label="Phone"
        value="+91-900-000-0001"
        href="tel:+919000000001"
        icon={<span data-testid="row-icon">i</span>}
      />,
    )

    const badge = screen.getByTestId('row-icon').closest('[aria-hidden="true"]')
    expect(badge).toHaveClass('bg-brand-amber-bg', 'text-brand-amber')
    expect(badge).not.toHaveClass('bg-brand-navy', 'text-white')
  })
})
