import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { JobSeekerSearchPage } from './JobSeekerSearchPage'

describe('JobSeekerSearchPage', () => {
  it('renders the placeholder heading and copy', () => {
    render(
      <MemoryRouter>
        <JobSeekerSearchPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /search for workers/i })).toBeInTheDocument()
    expect(
      screen.getByText(/coming soon — job seeker search isn't built yet/i),
    ).toBeInTheDocument()
  })

  it('links back to the landing page', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/seeker/search']}>
        <Routes>
          <Route path="/seeker/search" element={<JobSeekerSearchPage />} />
          <Route path="/" element={<div>Landing Screen</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /back to home/i }))

    expect(await screen.findByText('Landing Screen')).toBeInTheDocument()
  })
})
