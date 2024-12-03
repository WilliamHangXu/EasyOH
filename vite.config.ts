import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // port: the por to run when npm run preview
  // host: true expose the project in public address
  preview: {
    host: true,
    port: 8080
  }
})
