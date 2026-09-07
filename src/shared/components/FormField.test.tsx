import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormField } from './FormField'

describe('FormField', () => {
  it('renders the label associated with its child control', () => {
    render(
      <FormField id="name" label="Name">
        <input id="name" />
      </FormField>,
    )

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('shows a required marker when required is true', () => {
    render(
      <FormField id="name" label="Name" required>
        <input id="name" />
      </FormField>,
    )

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('does not show a required marker by default', () => {
    render(
      <FormField id="name" label="Name">
        <input id="name" />
      </FormField>,
    )

    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('renders a hint when provided', () => {
    render(
      <FormField id="name" label="Name" hint="As it appears on your ID">
        <input id="name" />
      </FormField>,
    )

    expect(screen.getByText('As it appears on your ID')).toBeInTheDocument()
  })

  it('renders the error as an alert linked by id when provided', () => {
    render(
      <FormField id="name" label="Name" error="Name is required">
        <input id="name" />
      </FormField>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Name is required')
    expect(alert).toHaveAttribute('id', 'name-error')
  })

  it('renders no error markup when error is absent', () => {
    render(
      <FormField id="name" label="Name">
        <input id="name" />
      </FormField>,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
