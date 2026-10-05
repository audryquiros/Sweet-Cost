import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En desarrollo, Vite actúa como proxy hacia n8n para evitar problemas de CORS
// al llamar al webhook desde el navegador.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/n8n': {
        target: 'http://localhost:5678',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
