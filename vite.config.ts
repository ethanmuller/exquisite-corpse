import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/exquisite-corpse/',
  plugins: [react()],
  server: {
    port: 8008,
    hmr: {
      clientPort: 5111,
    }
  },
})
