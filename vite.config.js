import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'docs',
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
  }
}) 