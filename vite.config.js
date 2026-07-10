import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'https://5nvt4h41-3000.inc1.devtunnels.ms';

  return {
    plugins: [
      tailwindcss(),
      react()
    ],
    server: {
      proxy: {
        '/shopify': {
          target: backendUrl.trim(),
          changeOrigin: true,
          secure: false,
          headers: {
            'X-Tunnel-Skip-AntiPhishing-Threshold': 'true',
            'bypass-tunnel-reminder': 'true'
          }
        }
      }
    }
  };
})
