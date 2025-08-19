import { defineConfig } from 'vite';

export default defineConfig({
  base: '/SurveillanceMapper/',
  
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          ol: ['ol']
        }
      }
    }
  }
});