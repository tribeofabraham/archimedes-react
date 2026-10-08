import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths: it's served at tribeofabraham.com/loud-math/archimedes-pi/, and works from any folder
  base: './',
})
