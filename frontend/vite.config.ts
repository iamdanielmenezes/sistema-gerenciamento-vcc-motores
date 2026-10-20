
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/client': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/maintenance': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/budget': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/payment': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

