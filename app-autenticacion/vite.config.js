import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Toda petición a /api se redirige al servidor real
      '/api': {
        target: 'https://sii.celaya.tecnm.mx',
        changeOrigin: true,   // cambia el header Host al del target
        secure: true,         // verifica certificado SSL
        // Si el servidor tiene problemas de SSL, cambia a: secure: false
      },
    },
  },
})
 
