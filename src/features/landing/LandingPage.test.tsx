import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { LandingPage } from './LandingPage'

describe('LandingPage', () => {
  it('renders the hero heading and both role CTAs', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Find local skilled workers. Get hired directly.',
    )
    expect(screen.getByRole('button', { name: /act as a worker/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /act as a job seeker/i })).toBeInTheDocument()
    expect(screen.getByText(/job portal · poc/i)).toBeInTheDocument()
    expect(screen.getByText(/no login required/i)).toBeInTheDocument()
  })

  it('navigates to /worker/register when "Act as a Worker" is clicked', async () => {
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

  it('navigates to /seeker/search when "Act as a Job Seeker" is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/seeker/search" element={<div>Job Seeker Screen</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /act as a job seeker/i }))

    expect(await screen.findByText('Job Seeker Screen')).toBeInTheDocument()
  })
})
