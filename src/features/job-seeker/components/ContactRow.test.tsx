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
})
