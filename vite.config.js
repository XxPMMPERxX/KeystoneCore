import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'core/keystone.ts'),
        vite: resolve(__dirname, 'vite-plugin/index.ts'),
      },
      formats: ['es'],
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
