import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';

export default defineConfig({
  plugins: [
    react(),
    inject({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
  resolve: {
    alias: {
      process: 'process/browser',
    },
  },
  optimizeDeps: {
    exclude: ['kuromoji'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  worker: {
    format: 'es',
    plugins: [
      inject({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),
    ],
  },
});
