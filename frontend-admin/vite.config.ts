import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [react(), viteTsconfigPaths()],
  resolve: {
    alias: {
      '~primereact': path.resolve(__dirname, 'node_modules/primereact'),
    },
  },
});
