import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
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

function renderPage() {
  return render(
    <MemoryRouter>
      <WorkerRegistrationPage />
    </MemoryRouter>,
  )
}

describe('WorkerRegistrationPage', () => {
  beforeEach(() => {
    mockedUseWorkerRegistration.mockReset()
  })

  it('renders the registration form by default', () => {
    mockedUseWorkerRegistration.mockReturnValue(createMutation())

    renderPage()

    expect(screen.getByRole('heading', { name: /worker registration/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit profile/i })).toBeInTheDocument()
  })

  it('shows the success message with the worker name after a successful submission', () => {
    mockedUseWorkerRegistration.mockReturnValue(
      createMutation({ isSuccess: true, data: { name: 'Jane Doe' } as Worker }),
    )

    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent(/thanks, jane doe/i)
    expect(screen.queryByRole('button', { name: /submit profile/i })).not.toBeInTheDocument()
  })

  it('shows the duplicate-profile banner and per-field messages when both email and phone are duplicated', () => {
    mockedUseWorkerRegistration.mockReturnValue(
      createMutation({
        isError: true,
        error: {
          code: 'DUPLICATE_EMAIL_AND_PHONE',
          message:
            'A profile with this Email or Phone Number already exists. Update the highlighted fields and try again.',
          field: 'email',
          fieldErrors: {
            email: 'A profile with this Email already exists.',
            phone: 'A profile with this Phone Number already exists.',
          },
        },
      }),
    )

    renderPage()

    const banner = screen.getByText(/profile already exists/i).closest('[role="alert"]')
    expect(banner).toHaveTextContent(
      /a profile with this email or phone number already exists/i,
    )
    expect(screen.getByText('A profile with this Email already exists.')).toBeInTheDocument()
    expect(screen.getByText('A profile with this Phone Number already exists.')).toBeInTheDocument()
  })

  it('shows a generic error banner for non-duplicate failures', () => {
    mockedUseWorkerRegistration.mockReturnValue(
      createMutation({
        isError: true,
        error: { code: 'UNKNOWN', message: 'boom' },
      }),
    )

    renderPage()

    expect(screen.getByRole('alert')).toHaveTextContent('Registration failed. Please try again.')
  })

  it('renders "Registration failed" (not "Profile already exists") as the heading for a non-duplicate error code', () => {
    mockedUseWorkerRegistration.mockReturnValue(
      createMutation({
        isError: true,
        error: { code: 'NETWORK_ERROR', message: 'Network Error' },
      }),
    )

    renderPage()

    expect(screen.getByText('Registration failed')).toBeInTheDocument()
    expect(screen.queryByText(/profile already exists/i)).not.toBeInTheDocument()
  })

  it('calls mutate with the submitted form values', async () => {
    const user = userEvent.setup()
    const mutation = createMutation()
    mockedUseWorkerRegistration.mockReturnValue(mutation)

    renderPage()
    await user.type(screen.getByLabelText(/^name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/email id/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '9876543210')
    await user.type(screen.getByLabelText(/^location/i), 'New York')
    await user.type(screen.getByLabelText(/age/i), '25')
    await user.click(screen.getByLabelText('Plumbing'))
    await user.click(screen.getByRole('button', { name: /submit profile/i }))

    expect(mutation.mutate).toHaveBeenCalledTimes(1)
    expect(mutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Jane Doe', email: 'jane@example.com', location: 'New York' }),
    )
  })

  it('disables the submit button while a submission is pending', () => {
    mockedUseWorkerRegistration.mockReturnValue(createMutation({ isPending: true }))

    renderPage()

    expect(screen.getByRole('button', { name: /submit profile/i })).toBeDisabled()
  })

  it('renders a link back to role selection', () => {
    mockedUseWorkerRegistration.mockReturnValue(createMutation())

    renderPage()

    expect(screen.getByRole('link', { name: /back to role selection/i })).toHaveAttribute('href', '/')
  })

  it('uses sticky-footer layout with flex wrapper and flex-1 main', () => {
    mockedUseWorkerRegistration.mockReturnValue(createMutation())

    const { container } = renderPage()

    // Root wrapper should have flex layout classes to support sticky footer
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('flex', 'min-h-screen', 'flex-col', 'bg-brand-bg')

    // Main should have flex-1 to push footer down
    const main = screen.getByRole('main')
    expect(main).toHaveClass('flex-1')
  })
})
