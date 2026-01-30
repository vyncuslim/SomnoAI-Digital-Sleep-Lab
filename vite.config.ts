
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.CLOUDFLARE_TURNSTILE_SITE_KEY': JSON.stringify('0x4AAAAAACNi1FM3bbfW_VsI'),
    'process.env.FOREST_ENV_SECRET': JSON.stringify(process.env.FOREST_ENV_SECRET || 'dbd5c7411e0fe0688d46850fbd6dc6310bdfb1de8bf41e4d276758c26f4626bc'),
    'process.env.FOREST_AUTH_SECRET': JSON.stringify(process.env.FOREST_AUTH_SECRET || 'ed2a662f907049be6360208157f82af15fabf31da3d27550'),
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
