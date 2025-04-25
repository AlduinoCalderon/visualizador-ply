import { defineConfig } from 'vite'

export default defineConfig({
  base: '/digital-twin-viewer/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
}) 