import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const forwardedPreviewHosts = ['.sg2.manus.computer'];

export default defineConfig({
  root,
  base: '/',
  publicDir: false,
  plugins: [react()],
  server: { host: '0.0.0.0', allowedHosts: forwardedPreviewHosts },
  preview: { host: '0.0.0.0', allowedHosts: forwardedPreviewHosts },
  build: {
    outDir: resolve(root, 'dist'),
    assetsDir: 'vite-assets',
    emptyOutDir: true,
    manifest: true,
    cssMinify: false,
    rollupOptions: { input: resolve(root, 'index.html') },
  },
});
