import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { SelectInput } from './SelectInput'

const options = [
  { value: 'downtown', label: 'Downtown' },
  { value: 'north-side', label: 'North Side' },
]

describe('SelectInput', () => {
  it('renders a disabled placeholder option followed by every option', () => {
    render(<SelectInput aria-label="Location" options={options} placeholder="Select a location" />)

    expect(screen.getByRole('option', { name: 'Select a location' })).toBeDisabled()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('omits the placeholder option when none is provided', () => {
    render(<SelectInput aria-label="Location" options={options} />)

    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('lets the user select an option', async () => {
    const user = userEvent.setup()
    render(<SelectInput aria-label="Location" options={options} placeholder="Select a location" />)

    await user.selectOptions(screen.getByLabelText('Location'), 'north-side')

    expect(screen.getByLabelText('Location')).toHaveValue('north-side')
  })

  it('marks the select as invalid via aria-invalid when invalid is true', () => {
    render(<SelectInput aria-label="Location" options={options} invalid />)

    expect(screen.getByLabelText('Location')).toHaveAttribute('aria-invalid', 'true')
  })
})
