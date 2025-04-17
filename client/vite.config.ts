/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, './src/assets'),
      '@components': resolve(__dirname, './src/components'),
      '@lib': resolve(__dirname, './src/lib'),
      '@shared': resolve(__dirname, '../shared'),
    },
  },
  optimizeDeps: {
    include: ['lucide-react', '@marsidev/react-turnstile']
  },
  build: {
    target: 'es2015',
    outDir: './dist',
    sourcemap: 'inline',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: false,
    terserOptions: {
      ecma: 5,
      compress: {
        ecma: 5,
      },
      format: {
        ecma: 5,
      },
    },
    commonjsOptions: {
      include: [/lucide-react/, /node_modules/]
    },
    rollupOptions: {
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}); 