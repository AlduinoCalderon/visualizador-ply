import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'loaders': ['three/examples/jsm/loaders/PLYLoader.js', 'three/examples/jsm/loaders/OBJLoader.js'],
          'controls': ['three/examples/jsm/controls/OrbitControls.js']
        },
        input: {
          main: resolve(__dirname, 'index.html'),
          embed: resolve(__dirname, 'src/pages/embed.html')
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}) 