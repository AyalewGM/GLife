import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync } from 'node:fs'
import { resolve } from 'node:path'

// Preserve the original mathematical engines and their relative asset paths
// until each experiment receives a separately tested React implementation.
function copyLegacyLabs() {
  return {
    name: 'copy-legacy-labs',
    closeBundle() {
      for (const folder of ['GL', 'Manibrot', 'img']) {
        cpSync(resolve(__dirname, folder), resolve(__dirname, 'dist', folder), { recursive: true })
      }
    }
  }
}

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/GLife/' : '/',
  plugins: [react(), copyLegacyLabs()]
})
