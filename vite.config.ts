import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))

// Preserve original mathematical engines and relative assets for this migration.
function copyLegacyLabs() {
  return {
    name: 'copy-legacy-labs',
    closeBundle() {
      for (const folder of ['GL', 'Manibrot', 'img']) {
        cpSync(resolve(root, folder), resolve(root, 'dist', folder), { recursive: true })
      }
    }
  }
}

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/GLife/' : '/',
  plugins: [react(), copyLegacyLabs()]
})
