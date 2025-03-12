import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import fs from 'fs';

// 读取manifest.json
const manifest = JSON.parse(
  fs.readFileSync(resolve('./public/manifest.json'), 'utf-8')
);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': resolve('./src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve('./index.html'),
        options: resolve('./options.html'),
      },
    },
  },
}); 