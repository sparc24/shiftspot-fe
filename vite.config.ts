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
      //
      // Only registered when VITE_API_PROXY_TARGET is actually set. Without
      // this guard, an unset var (e.g. a fresh clone with no .env yet) makes
      // Vite start a proxy with an empty target, which then fails every
      // `/api` request with an opaque 502 ("Must set target or forward").
      // Omitting the proxy entirely instead turns that into a plain 404 —
      // "this isn't being proxied" is a much clearer signal than a 502.
      proxy: env.VITE_API_PROXY_TARGET
        ? {
            '/api': {
              target: env.VITE_API_PROXY_TARGET,
              changeOrigin: true,
            },
          }
        : undefined,
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
