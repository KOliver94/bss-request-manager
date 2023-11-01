import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    build: {
      assetsDir: 'static/frontend',
      outDir: 'build',
    },
    loader: { '.js': 'jsx' },
    plugins: [basicSsl(), react(), VitePWA()],
    resolve: {
      alias: {
        src: '/src',
      },
    },
    server: {
      https: true,
    },
  };
});
