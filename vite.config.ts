import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so built asset URLs (e.g. "assets/x.js" instead of
// "/Schedule/assets/x.js") resolve correctly both standalone on GitHub
// Pages and inside MyGeotab's Add-In loader, which fetches this page's
// HTML and prefixes relative asset paths with its own directory via
// plain string concatenation rather than proper URL resolution — an
// absolute base path gets double-prefixed there and 404s.
export default defineConfig({
  base: './',
  plugins: [react()],
})
