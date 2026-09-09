import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { WorkerRegistrationForm } from './WorkerRegistrationForm'

type FormProps = Parameters<typeof WorkerRegistrationForm>[0]

function renderForm(overrides: Partial<Omit<FormProps, 'onSubmit'>> = {}) {
  const onSubmit = vi.fn()
  render(
    <MemoryRouter initialEntries={['/worker/register']}>
      <Routes>
        <Route
          path="/worker/register"
          element={<WorkerRegistrationForm onSubmit={onSubmit} isSubmitting={false} {...overrides} />}
        />
        <Route path="/" element={<div>Landing Screen</div>} />
      </Routes>
    </MemoryRouter>,
  )
  return { onSubmit }
}

describe('WorkerRegistrationForm', () => {
  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: /submit profile/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits with valid values', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.type(screen.getByLabelText(/^name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/email id/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '9876543210')
    await user.type(screen.getByLabelText(/location/i), 'New York')
    await user.type(screen.getByLabelText(/age/i), '25')
    await user.click(screen.getByLabelText('Plumbing'))
    await user.click(screen.getByRole('button', { name: /submit profile/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const submitted = onSubmit.mock.calls[0][0]
    expect(submitted.name).toBe('Jane Doe')
    expect(submitted.location).toBe('New York')
    expect(submitted.skills).toContain('plumbing')
  })

  it('associates the Skills group with its label and error for assistive tech', async () => {
    const user = userEvent.setup()
    renderForm()

    const skillsGroup = screen.getByLabelText(/skills/i)
    expect(skillsGroup.tagName).toBe('FIELDSET')
    expect(skillsGroup).toHaveAttribute('aria-required', 'true')

    await user.click(screen.getByRole('button', { name: /submit profile/i }))

    await waitFor(() => {
      expect(skillsGroup).toHaveAttribute('aria-describedby', 'skills-error')
    })
  })

  it('marks every mandatory field as aria-required', () => {
    renderForm()

    for (const label of [/^name/i, /email id/i, /phone number/i, /^location/i, /age/i]) {
      expect(screen.getByLabelText(label)).toHaveAttribute('aria-required', 'true')
    }
  })

  it('moves keyboard focus to the first invalid field after a failed submit', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: /submit profile/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/^name/i)).toHaveFocus()
    })
  })

  it('supports tabbing sequentially through every field to the submit button', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.tab()
    expect(screen.getByLabelText(/^name/i)).toHaveFocus()

    await user.tab()
    expect(screen.getByLabelText(/email id/i)).toHaveFocus()

    await user.tab()
    expect(screen.getByLabelText(/phone number/i)).toHaveFocus()

    await user.tab()
    expect(screen.getByLabelText(/^location/i)).toHaveFocus()

    await user.tab()
    expect(screen.getByLabelText(/age/i)).toHaveFocus()
  })

  it('clears a field error once the user corrects the value', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: /submit profile/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/^name/i)).toHaveAttribute('aria-invalid', 'true')
    })

    await user.type(screen.getByLabelText(/^name/i), 'Jane Doe')

    await waitFor(() => {
      expect(screen.getByLabelText(/^name/i)).toHaveAttribute('aria-invalid', 'false')
    })
  })

  it('shows the email helper hint only when there is no email error', async () => {
    const user = userEvent.setup()
    renderForm()

    expect(
      screen.getByText(/used by job seekers to contact you — must be unique on shiftspot/i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /submit profile/i }))

    await waitFor(() => {
      expect(
        screen.queryByText(/used by job seekers to contact you — must be unique on shiftspot/i),
      ).not.toBeInTheDocument()
    })
  })

  it('applies server-provided duplicate field errors to email and phone', async () => {
    renderForm({
      serverFieldErrors: {
        email: 'A profile with this Email already exists.',
        phone: 'A profile with this Phone Number already exists.',
      },
    })

    await waitFor(() => {
      expect(screen.getByText('A profile with this Email already exists.')).toBeInTheDocument()
      expect(screen.getByText('A profile with this Phone Number already exists.')).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/email id/i)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/phone number/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('moves focus to the email field when serverFieldErrors includes email', async () => {
    renderForm({
      serverFieldErrors: {
        email: 'A profile with this Email already exists.',
        phone: 'A profile with this Phone Number already exists.',
      },
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/email id/i)).toHaveFocus()
    })
  })

  it('moves focus to the phone field when serverFieldErrors only includes phone', async () => {
    renderForm({
      serverFieldErrors: {
        phone: 'A profile with this Phone Number already exists.',
      },
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/phone number/i)).toHaveFocus()
    })
  })

  it('does not move focus when serverFieldErrors is undefined', async () => {
    renderForm()

    expect(screen.getByLabelText(/^name/i)).not.toHaveFocus()
    expect(screen.getByLabelText(/email id/i)).not.toHaveFocus()
    expect(screen.getByLabelText(/phone number/i)).not.toHaveFocus()
    expect(document.body).toHaveFocus()
  })

  it('does not move focus when serverFieldErrors is an empty object', async () => {
    renderForm({ serverFieldErrors: {} })

    expect(document.body).toHaveFocus()
  })

  it('navigates back to the landing page when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(await screen.findByText('Landing Screen')).toBeInTheDocument()
  })
})
