import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.GA_PROPERTY_ID': JSON.stringify(process.env.GA_PROPERTY_ID),
    'process.env.CLOUDFLARE_TURNSTILE_SITE_KEY': JSON.stringify(process.env.CLOUDFLARE_TURNSTILE_SITE_KEY),
    'process.env.FOREST_ENV_SECRET': JSON.stringify(process.env.FOREST_ENV_SECRET),
    'process.env.FOREST_AUTH_SECRET': JSON.stringify(process.env.FOREST_AUTH_SECRET),
    'process.env.DATABASE_URL': JSON.stringify(process.env.DATABASE_URL)
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion', 'recharts']
        }
      }
    }
  }
});