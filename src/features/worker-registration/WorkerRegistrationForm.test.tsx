import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { WorkerRegistrationForm } from './WorkerRegistrationForm'

describe('WorkerRegistrationForm', () => {
  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<WorkerRegistrationForm onSubmit={onSubmit} isSubmitting={false} />)

    await user.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits with valid values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<WorkerRegistrationForm onSubmit={onSubmit} isSubmitting={false} />)

    await user.type(screen.getByLabelText(/name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/phone/i), '9876543210')
    await user.selectOptions(screen.getByLabelText(/location/i), 'downtown')
    await user.type(screen.getByLabelText(/age/i), '25')
    await user.click(screen.getByLabelText(/cleaning/i))
    await user.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const submitted = onSubmit.mock.calls[0][0]
    expect(submitted.name).toBe('Jane Doe')
    expect(submitted.skills).toContain('cleaning')
  })
})
