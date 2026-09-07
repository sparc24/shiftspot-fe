import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'

import { TextInput } from './TextInput'

describe('TextInput', () => {
  it('renders an input that accepts typed text', async () => {
    const user = userEvent.setup()
    render(<TextInput aria-label="Name" />)

    await user.type(screen.getByLabelText('Name'), 'Jane Doe')

    expect(screen.getByLabelText('Name')).toHaveValue('Jane Doe')
  })

  it('marks the input as invalid via aria-invalid when invalid is true', () => {
    render(<TextInput aria-label="Email" invalid />)

    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('is not marked invalid by default', () => {
    render(<TextInput aria-label="Email" />)

    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false')
  })

  it('forwards the ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>()

    render(<TextInput aria-label="Phone" ref={ref} />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
