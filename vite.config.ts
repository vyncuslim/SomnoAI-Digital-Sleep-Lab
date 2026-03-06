import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: process.cwd(),
  plugins: [react()],
  build: {
    rollupOptions: {
      input: 'index.html',
    },
  },
});
