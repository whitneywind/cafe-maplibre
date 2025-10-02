import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // frontend port
    proxy: {
      "/api": {
        target: "http://localhost:3000", // my Express backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
