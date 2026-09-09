/// <reference types="vitest/config" />
import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      // Works around the backend sending no CORS headers (SLPTWM-129 §6.6):
      // the browser makes a same-origin request that Vite forwards
      // server-side, where CORS does not apply. Dev-only — absent from the
      // production bundle.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET,
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
      },
    },
  }
})
