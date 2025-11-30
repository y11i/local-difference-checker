import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname, 'app/renderer'),
  base: './', // Use relative paths for Electron file:// protocol
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'app/renderer/src')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
