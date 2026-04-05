import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Output to root-level dist/client so Express can serve it in production
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api requests to Express in development — no CORS needed
      '/api': 'http://localhost:3000',
    },
  },
})
