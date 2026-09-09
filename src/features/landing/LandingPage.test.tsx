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

  // Penpot design-alignment regression guard (commit cc5d423): the outline
  // button's notch-cut corner previously relied on a single-element
  // .notch-btn-outline + ::before mask-composite technique that did not
  // reliably render. It was replaced with a wrapper <div> carrying the outer
  // navy notch shape (.notch-btn-outline-frame) around the inner Button,
  // which reuses .notch-btn for the inner white notch shape. These are
  // structural class checks, not a CSS-rendering test — jsdom can't verify
  // clip-path/mask-composite visually.
  it('LandingPage_actAsJobSeekerButton_isWrappedInNotchOutlineFrameWithNotchBtnInner', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    const jobSeekerButton = screen.getByRole('button', { name: /act as a job seeker/i })
    expect(jobSeekerButton).toHaveClass('notch-btn')
    expect(jobSeekerButton.parentElement).toHaveClass('notch-btn-outline-frame')
  })

  it('LandingPage_actAsWorkerButton_usesNotchBtnDirectlyWithoutOutlineFrameWrapper', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    const workerButton = screen.getByRole('button', { name: /act as a worker/i })
    expect(workerButton).toHaveClass('notch-btn')
    expect(workerButton.parentElement).not.toHaveClass('notch-btn-outline-frame')
  })
})
