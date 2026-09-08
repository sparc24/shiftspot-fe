import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ErrorAlert } from './ErrorAlert'

describe('ErrorAlert', () => {
  it('renders the message as an alert', () => {
    render(<ErrorAlert message="Something went wrong" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  })

  it('does not render a retry button when onRetry is omitted', () => {
    render(<ErrorAlert message="Something went wrong" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onRetry when the retry button is clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorAlert message="Something went wrong" onRetry={onRetry} />)

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
