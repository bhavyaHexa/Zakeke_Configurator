import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/shopify': {
        target: 'https://5nvt4h41-3000.inc1.devtunnels.ms',
        changeOrigin: true,
        secure: false,
        headers: {
          'X-Tunnel-Skip-AntiPhishing-Threshold': 'true',
          'bypass-tunnel-reminder': 'true'
        }
      }
    }
  }
})
