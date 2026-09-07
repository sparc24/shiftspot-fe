import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('renders children with the primary variant by default', () => {
    render(<Button>Submit</Button>)

    const button = screen.getByRole('button', { name: 'Submit' })

    expect(button).toHaveClass('bg-blue-600')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('applies secondary variant classes when requested', () => {
    render(<Button variant="secondary">Cancel</Button>)

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('border-blue-600')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)

    await user.click(screen.getByRole('button', { name: 'Click me' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disables the button and marks it busy while isLoading', () => {
    render(<Button isLoading>Register</Button>)

    const button = screen.getByRole('button', { name: 'Register' })

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('disables the button when disabled is passed explicitly', () => {
    render(<Button disabled>Register</Button>)

    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled()
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Register
      </Button>,
    )

    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(onClick).not.toHaveBeenCalled()
  })
})
