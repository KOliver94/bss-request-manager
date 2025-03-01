import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    build: {
      assetsDir: 'static/frontend',
      outDir: 'build',
      // sourcemap: true, // When you want to use source-map-explorer
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    loader: { '.js': 'jsx' },
    plugins: [
      basicSsl(),
      react(),
      VitePWA({
        includeAssests: [
          'apple-touch-icon.png',
          'favicon.ico',
          'mask-icon.svg',
        ],
        manifest: {
          background_color: '#f0e7db',
          display: 'standalone',
          description:
            'A Budavári Schönherz Stúdió forgatási és élő közvetítési felkéréseit kezelő rendszere.',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          name: 'Budavári Schönherz Stúdió Felkéréskezelő alkalmazás',
          orientation: 'portrait',
          scope: '/',
          short_name: 'BSS Felkéréskezelő',
          start_url: '/',
          theme_color: '#3c4858',
        },
        registerType: 'prompt',
        workbox: {
          globPatterns: ['**/*.{css,eot,html,ico,jpg,js,png,svg,ttf,woof}'],
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
