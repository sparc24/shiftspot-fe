import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { App } from './App'

describe('App', () => {
  it('renders the landing page at the root route', async () => {
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('ShiftSpot Job Portal')
  })

  it('navigates to the worker registration page when the CTA is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: /act as a worker/i }))

    expect(await screen.findByRole('heading', { name: /worker registration/i })).toBeInTheDocument()
  })
})
