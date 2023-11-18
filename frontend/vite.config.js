import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    build: {
      assetsDir: 'static/frontend',
      outDir: 'build',
      // sourcemap: true, // When you want to use source-map-explorer
    },
    loader: { '.js': 'jsx' },
    plugins: [
      basicSsl(),
      react(),
      VitePWA({
        workbox: {
          navigateFallbackDenylist: [/^\/admin/, /^\/api/, /^\/django-admin/],
        },
      }),
    ],
    resolve: {
      alias: {
        src: '/src',
      },
    },
  };
});
