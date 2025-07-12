import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    https: false, // Cambiar a true si necesitas HTTPS para la cámara
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mediapipe: ['@mediapipe/tasks-vision'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@mediapipe/tasks-vision'],
  },
  define: {
    global: 'globalThis',
  },
})