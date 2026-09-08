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
