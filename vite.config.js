import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
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
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
}) 