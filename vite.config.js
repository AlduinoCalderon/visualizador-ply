import { defineConfig } from 'vite'

export default defineConfig({
  base: '/digital-twin-viewer/',
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    emptyOutDir: true
  }
}) 