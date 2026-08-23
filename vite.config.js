import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'html/index.html'),
        menu: resolve(__dirname, 'html/menu.html'),
        checkout: resolve(__dirname, 'html/checkout.html'),
        orderHistory: resolve(__dirname, 'html/order-history.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
