import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/off-search': {
        target: 'https://search.openfoodfacts.org',
        changeOrigin: true,
        headers: {
          'User-Agent': 'AroNutrition/1.0 (https://github.com/DrNitz/Aro)'
        },
        rewrite: (path) => path.replace(/^\/api\/off-search/, '')
      },
      '/api/off': {
        target: 'https://world.openfoodfacts.org',
        changeOrigin: true,
        headers: {
          'User-Agent': 'AroNutrition/1.0 (https://github.com/DrNitz/Aro)'
        },
        rewrite: (path) => path.replace(/^\/api\/off/, '')
      }
    }
  }
})
