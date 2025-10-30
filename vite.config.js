import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'core/index.ts'),
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
      ],
    }
  },
});
