import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/mobile-wallet-publish/',
  plugins: [react(), tailwindcss()],
});
