import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { Router } from './Router'

function renderRouter(initialEntry: string) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Router />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Router', () => {
  it('renders the landing page at /', async () => {
    renderRouter('/')

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Find local skilled workers. Get hired directly.',
    )
  })

  it('renders the worker registration page at /worker/register', async () => {
    renderRouter('/worker/register')

    expect(await screen.findByRole('heading', { name: /worker registration/i })).toBeInTheDocument()
  })

  it('renders the job seeker placeholder page at /seeker/search', async () => {
    renderRouter('/seeker/search')

    expect(await screen.findByRole('heading', { name: /search for workers/i })).toBeInTheDocument()
  })

  it('redirects an unknown path to the landing page', async () => {
    renderRouter('/nonexistent')

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Find local skilled workers. Get hired directly.',
    )
  })
})
