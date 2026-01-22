import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig(({ mode }) => {
  const isTest = mode === 'test' || process.env.VITEST === 'true'

  return {
    plugins: isTest
      ? [
          viteTsConfigPaths({
            projects: ['./tsconfig.json'],
          }),
          tailwindcss(),
          viteReact(),
        ]
      : [
          devtools(),
          nitro(),
          viteTsConfigPaths({
            projects: ['./tsconfig.json'],
          }),
          tailwindcss(),
          tanstackStart(),
          viteReact(),
        ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
    },
  }
})

export default config
