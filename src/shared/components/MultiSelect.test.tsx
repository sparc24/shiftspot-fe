import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MultiSelect } from './MultiSelect'

const options = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'delivery', label: 'Delivery' },
] as const

describe('MultiSelect', () => {
  it('renders a checkbox for every option', () => {
    render(<MultiSelect id="skills" name="skills" options={options} value={[]} onChange={vi.fn()} />)

    expect(screen.getByLabelText('Cleaning')).toBeInTheDocument()
    expect(screen.getByLabelText('Delivery')).toBeInTheDocument()
  })

  it('checks the boxes matching the current value', () => {
    render(
      <MultiSelect id="skills" name="skills" options={options} value={['delivery']} onChange={vi.fn()} />,
    )

    expect(screen.getByLabelText('Cleaning')).not.toBeChecked()
    expect(screen.getByLabelText('Delivery')).toBeChecked()
  })

  it('adds the skill to the value when an unchecked box is checked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <MultiSelect id="skills" name="skills" options={options} value={['delivery']} onChange={onChange} />,
    )

    await user.click(screen.getByLabelText('Cleaning'))

    expect(onChange).toHaveBeenCalledWith(['delivery', 'cleaning'])
  })

  it('removes the skill from the value when a checked box is unchecked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <MultiSelect
        id="skills"
        name="skills"
        options={options}
        value={['cleaning', 'delivery']}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByLabelText('Cleaning'))

    expect(onChange).toHaveBeenCalledWith(['delivery'])
  })

  it('associates the group with its label and error via aria attributes', () => {
    render(
      <MultiSelect
        id="skills"
        name="skills"
        options={options}
        value={[]}
        onChange={vi.fn()}
        invalid
        describedById="skills-error"
      />,
    )

    const group = screen.getByRole('group')
    expect(group).toHaveAttribute('aria-labelledby', 'skills-label')
    expect(group).toHaveAttribute('aria-describedby', 'skills-error')
    expect(group).toHaveAttribute('aria-invalid', 'true')
  })
})
