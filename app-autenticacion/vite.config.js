import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api/proxy': {
        target: 'https://sii.celaya.tecnm.mx',
        changeOrigin: true,
        rewrite: () => '/api/login',
        secure: false,
      },
      '/api/movil': {
        target: 'https://sii.celaya.tecnm.mx',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

