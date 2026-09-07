import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useWorkerRegistration } from '@/shared/hooks'
import type { ApiError, Worker } from '@/shared/types'

import { WorkerRegistrationPage } from './WorkerRegistrationPage'

vi.mock('@/shared/hooks', () => ({
  useWorkerRegistration: vi.fn(),
}))

const mockedUseWorkerRegistration = vi.mocked(useWorkerRegistration)

interface MutationOverrides {
  isPending?: boolean
  isSuccess?: boolean
  isError?: boolean
  data?: Worker
  error?: ApiError | null
}

function createMutation(overrides: MutationOverrides = {}) {
  return {
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    data: undefined,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useWorkerRegistration>
}

describe('WorkerRegistrationPage', () => {
  beforeEach(() => {
    mockedUseWorkerRegistration.mockReset()
  })

  it('renders the registration form by default', () => {
    mockedUseWorkerRegistration.mockReturnValue(createMutation())

    render(<WorkerRegistrationPage />)

    expect(screen.getByRole('heading', { name: /worker registration/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('shows the success message with the worker name after a successful submission', () => {
    mockedUseWorkerRegistration.mockReturnValue(
      createMutation({ isSuccess: true, data: { name: 'Jane Doe' } as Worker }),
    )

    render(<WorkerRegistrationPage />)

    expect(screen.getByRole('status')).toHaveTextContent(/thanks, jane doe/i)
    expect(screen.queryByRole('button', { name: /register/i })).not.toBeInTheDocument()
  })

  it('shows the duplicate-email message verbatim when registration fails with DUPLICATE_EMAIL', () => {
    mockedUseWorkerRegistration.mockReturnValue(
      createMutation({
        isError: true,
        error: { code: 'DUPLICATE_EMAIL', message: 'A worker with this email is already registered.', field: 'email' },
      }),
    )

    render(<WorkerRegistrationPage />)

    expect(screen.getByRole('alert')).toHaveTextContent('A worker with this email is already registered.')
  })

  it('shows a generic error message for non-duplicate-email failures', () => {
    mockedUseWorkerRegistration.mockReturnValue(
      createMutation({
        isError: true,
        error: { code: 'UNKNOWN', message: 'boom' },
      }),
    )

    render(<WorkerRegistrationPage />)

    expect(screen.getByRole('alert')).toHaveTextContent('Registration failed. Please try again.')
  })

  it('calls reset when the retry button is clicked', async () => {
    const user = userEvent.setup()
    const mutation = createMutation({
      isError: true,
      error: { code: 'UNKNOWN', message: 'boom' },
    })
    mockedUseWorkerRegistration.mockReturnValue(mutation)

    render(<WorkerRegistrationPage />)
    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(mutation.reset).toHaveBeenCalledTimes(1)
  })

  it('calls mutate with the submitted form values', async () => {
    const user = userEvent.setup()
    const mutation = createMutation()
    mockedUseWorkerRegistration.mockReturnValue(mutation)

    render(<WorkerRegistrationPage />)
    await user.type(screen.getByLabelText(/name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/phone/i), '9876543210')
    await user.selectOptions(screen.getByLabelText(/location/i), 'downtown')
    await user.type(screen.getByLabelText(/age/i), '25')
    await user.click(screen.getByLabelText(/cleaning/i))
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(mutation.mutate).toHaveBeenCalledTimes(1)
    expect(mutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Jane Doe', email: 'jane@example.com' }),
    )
  })

  it('disables the submit button while a submission is pending', () => {
    mockedUseWorkerRegistration.mockReturnValue(createMutation({ isPending: true }))

    render(<WorkerRegistrationPage />)

    expect(screen.getByRole('button', { name: /register/i })).toBeDisabled()
  })
})
