import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SuccessMessage } from './SuccessMessage'

describe('SuccessMessage', () => {
  it('renders the title inside a polite status region', () => {
    render(<SuccessMessage title="Registration complete" />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent('Registration complete')
  })

  it('renders the description when provided', () => {
    render(<SuccessMessage title="Registration complete" description="Thanks, Jane Doe!" />)

    expect(screen.getByText('Thanks, Jane Doe!')).toBeInTheDocument()
  })

  it('omits the description paragraph when not provided', () => {
    render(<SuccessMessage title="Registration complete" />)

    expect(screen.queryByText(/thanks/i)).not.toBeInTheDocument()
  })

  it('renders additional children', () => {
    render(
      <SuccessMessage title="Registration complete">
        <p>Extra detail</p>
      </SuccessMessage>,
    )

    expect(screen.getByText('Extra detail')).toBeInTheDocument()
  })
})
