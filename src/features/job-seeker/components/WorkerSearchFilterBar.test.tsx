import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { WorkerSearchFilterBar } from './WorkerSearchFilterBar'

describe('WorkerSearchFilterBar', () => {
  it('WorkerSearchFilterBar_whenSkillChipClicked_togglesItOnThenOff', async () => {
    const user = userEvent.setup()
    render(<WorkerSearchFilterBar onSearch={vi.fn()} isSearching={false} />)

    const plumbingChip = screen.getByLabelText('Plumbing')
    expect(plumbingChip).not.toBeChecked()

    await user.click(plumbingChip)
    expect(plumbingChip).toBeChecked()

    await user.click(plumbingChip)
    expect(plumbingChip).not.toBeChecked()
  })

  it('WorkerSearchFilterBar_whenFocusedChipReceivesSpaceKey_activatesTheChip', async () => {
    const user = userEvent.setup()
    render(<WorkerSearchFilterBar onSearch={vi.fn()} isSearching={false} />)

    const electricalChip = screen.getByLabelText('Electrical')
    electricalChip.focus()
    await user.keyboard(' ')

    expect(electricalChip).toBeChecked()
  })

  it('WorkerSearchFilterBar_withNonNumericAge_blocksSubmitAndShowsValidationError', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<WorkerSearchFilterBar onSearch={onSearch} isSearching={false} />)

    await user.type(screen.getByLabelText(/^age/i), 'abc')
    await user.click(screen.getByRole('button', { name: /find workers/i }))

    expect(await screen.findByText('Enter age as a whole number')).toBeInTheDocument()
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('WorkerSearchFilterBar_withValidData_callsOnSearchWithNormalisedFiltersDroppingEmptyFields', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<WorkerSearchFilterBar onSearch={onSearch} isSearching={false} />)

    await user.click(screen.getByLabelText('Plumbing'))
    await user.click(screen.getByRole('button', { name: /find workers/i }))

    expect(onSearch).toHaveBeenCalledWith({ skills: ['plumbing'] })
  })

  it('WorkerSearchFilterBar_withLocationOverEightyCharacters_blocksSubmitAndShowsValidationError', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<WorkerSearchFilterBar onSearch={onSearch} isSearching={false} />)

    await user.type(screen.getByLabelText(/^location/i), 'x'.repeat(81))
    await user.click(screen.getByRole('button', { name: /find workers/i }))

    expect(await screen.findByText('Location must be 80 characters or fewer')).toBeInTheDocument()
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('WorkerSearchFilterBar_withLocationAndAgeFilled_callsOnSearchWithTrimmedLocationAndNumericAge', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<WorkerSearchFilterBar onSearch={onSearch} isSearching={false} />)

    await user.type(screen.getByLabelText(/^location/i), '  Cochin, Kerala  ')
    await user.type(screen.getByLabelText(/^age/i), '30')
    await user.click(screen.getByRole('button', { name: /find workers/i }))

    expect(onSearch).toHaveBeenCalledWith({
      skills: [],
      location: 'Cochin, Kerala',
      age: 30,
    })
  })

  it('WorkerSearchFilterBar_whileSearching_marksSubmitButtonAriaBusyAndDisabled', () => {
    render(<WorkerSearchFilterBar onSearch={vi.fn()} isSearching />)

    const submitButton = screen.getByRole('button', { name: /find workers/i })
    expect(submitButton).toHaveAttribute('aria-busy', 'true')
    expect(submitButton).toBeDisabled()
  })

  // Penpot design-alignment regression guards (commit 128146e).
  it('WorkerSearchFilterBar_rendersSkillFilterGroupLabelNotSkills', () => {
    render(<WorkerSearchFilterBar onSearch={vi.fn()} isSearching={false} />)

    expect(screen.getByRole('group', { name: 'Skill Filter' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Skills' })).not.toBeInTheDocument()
  })

  it('WorkerSearchFilterBar_rendersLocationAndAgePlaceholdersMatchingApprovedCopy', () => {
    render(<WorkerSearchFilterBar onSearch={vi.fn()} isSearching={false} />)

    expect(screen.getByPlaceholderText('e.g. New York')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. 30')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('City, Country')).not.toBeInTheDocument()
  })

  it('WorkerSearchFilterBar_rendersFindWorkersButtonWithNotchBtnClass', () => {
    render(<WorkerSearchFilterBar onSearch={vi.fn()} isSearching={false} />)

    expect(screen.getByRole('button', { name: /find workers/i })).toHaveClass('notch-btn')
  })
})
