import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo-relative base so the built app resolves correctly when served
// from https://<owner>.github.io/Schedule/ (GitHub Pages project site).
export default defineConfig({
  base: '/Schedule/',
  plugins: [react()],
})
