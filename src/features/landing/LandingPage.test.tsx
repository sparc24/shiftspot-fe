import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { LandingPage } from './LandingPage'

describe('LandingPage', () => {
  it('renders the heading and CTA', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ShiftSpot Job Portal')
    expect(screen.getByRole('button', { name: /act as a worker/i })).toBeInTheDocument()
  })

  it('navigates to /worker/register when the CTA is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/worker/register" element={<div>Registration Screen</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /act as a worker/i }))

    expect(await screen.findByText('Registration Screen')).toBeInTheDocument()
  })
})
