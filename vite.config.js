import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  // base: `/${import.meta.env.VITE_IMAGE_PATH}`,
  // base: '/admin',
  // server: {
  //   host: '159.65.143.49',
  //   port: 5174,
  // },

  base: '/admin', // '/admin/'
  /* base: '/admin_new', // '/admin_new/' */

  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})

