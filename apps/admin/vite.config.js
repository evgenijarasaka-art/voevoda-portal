import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  // Собственный public: раньше стоял '../portal/public', но при деплое админки
  // на Vercel папки портала в сборочном контейнере нет — логотип и фавикон
  // не попадали в билд. Картинки курсов админка всё равно берёт с портала
  // (portalAssetUrl), от своего origin ей нужны только логотип, фавикон и seed.
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
    },
  },
  server: {
    port: 3001,
  },
}); 
