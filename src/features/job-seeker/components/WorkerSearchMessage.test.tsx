import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SEARCH_EMPTY_MESSAGE, SEARCH_IDLE_MESSAGE, SEARCH_LOADING_MESSAGE } from '../constants'
import { WorkerSearchMessage } from './WorkerSearchMessage'

describe('WorkerSearchMessage', () => {
  describe('empty variant', () => {
    // Penpot design-alignment regression guard (commit 128146e): the empty
    // state now gets an icon + heading treatment above the description text.
    it('WorkerSearchMessage_withEmptyVariant_rendersNoWorkersFoundHeadingAboveDescription', () => {
      render(<WorkerSearchMessage variant="empty" />)

      expect(screen.getByText('No workers found')).toBeInTheDocument()
      expect(screen.getByText(SEARCH_EMPTY_MESSAGE)).toBeInTheDocument()
    })

    it('WorkerSearchMessage_withEmptyVariant_rendersSearchIconInAnAriaHiddenBadge', () => {
      const { container } = render(<WorkerSearchMessage variant="empty" />)

      const badge = container.querySelector('[aria-hidden="true"]')
      expect(badge).toBeInTheDocument()
      expect(badge?.querySelector('svg')).toBeInTheDocument()
    })

    // Penpot design-alignment regression guard (commit cc5d423): the heading
    // dropped the serif override in favor of the default sans font, the
    // layout switched from mt-4/mt-2 margins to a flex+gap column, and the
    // icon badge/icon grew a size step. Structural class checks only.
    it('WorkerSearchMessage_withEmptyVariant_usesFlexColumnLayoutWithGapInsteadOfMargins', () => {
      const { container } = render(<WorkerSearchMessage variant="empty" />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'gap-4')
    })

    it('WorkerSearchMessage_withEmptyVariant_headingUsesSansSemiboldNotSerifBold', () => {
      render(<WorkerSearchMessage variant="empty" />)

      const heading = screen.getByText('No workers found')
      expect(heading).toHaveClass('text-xl', 'font-semibold')
      expect(heading).not.toHaveClass('font-serif', 'font-bold', 'text-lg')
    })

    it('WorkerSearchMessage_withEmptyVariant_rendersLargerIconBadgeAndIcon', () => {
      const { container } = render(<WorkerSearchMessage variant="empty" />)

      const badge = container.querySelector('[aria-hidden="true"]')
      expect(badge).toHaveClass('h-20', 'w-20')
      expect(badge?.querySelector('svg')).toHaveClass('h-7', 'w-7')
    })
  })

  describe('idle variant', () => {
    it('WorkerSearchMessage_withIdleVariant_rendersIdleMessageOnly', () => {
      render(<WorkerSearchMessage variant="idle" />)

      expect(screen.getByText(SEARCH_IDLE_MESSAGE)).toBeInTheDocument()
      expect(screen.queryByText('No workers found')).not.toBeInTheDocument()
    })
  })

  describe('loading variant', () => {
    it('WorkerSearchMessage_withLoadingVariant_rendersLoadingMessageOnly', () => {
      render(<WorkerSearchMessage variant="loading" />)

      expect(screen.getByText(SEARCH_LOADING_MESSAGE)).toBeInTheDocument()
      expect(screen.queryByText('No workers found')).not.toBeInTheDocument()
    })
  })
})
