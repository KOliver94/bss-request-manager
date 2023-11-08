import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    assetsDir: 'static/frontend-admin',
    outDir: 'build',
    rollupOptions: {
      input: {
        app: './admin.html',
      },
    },
    // sourcemap: true, // When you want to use source-map-explorer
  },
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '~primereact': path.resolve(__dirname, 'node_modules/primereact'),
    },
  },
});
