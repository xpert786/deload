import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Enable network access
    port: 5173, // Default Vite port
    proxy: {
      '/api': {
        target: 'http://168.231.121.7/deload',
        changeOrigin: true,
        secure: false,
        // No rewrite needed - /api/coach/signup/ will go to http://168.231.121.7/deload/api/coach/signup/
      },
    },
  },
})
