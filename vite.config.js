import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'core'),
    },
  },
  build: {
    ssr: true,
    lib: {
      entry: {
        'index': resolve(__dirname, 'core/index.ts'),
        'form/jsx-runtime/index': resolve(__dirname, 'core/form/tsx/runtime.ts'),
        'form/component/index': resolve(__dirname, 'core/form/tsx/components/index.ts'),
        'vite-plugin/index': resolve(__dirname, 'vite-plugin/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        '@minecraft/server',
        '@minecraft/server-net',
        '@minecraft/server-ui',
        'path',
        'node:crypto',
        'node:fs',
      ],
    }
  },
});
