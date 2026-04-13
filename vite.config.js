import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  base: '/admin/',
  // base: '/admin_new/',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})

