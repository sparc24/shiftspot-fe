import { cleanup } from '@testing-library/react'

import '@testing-library/jest-dom/vitest'

// cleanup after each test case
// @ts-ignore - afterEach is a global with globals: true in vitest config
afterEach(() => {
  cleanup()
})
