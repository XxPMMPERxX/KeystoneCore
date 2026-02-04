import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'core'),
      '@minecraft/server': resolve(__dirname, 'tests/mocks/minecraft-server.ts'),
      '@minecraft/server-ui': resolve(__dirname, 'tests/mocks/minecraft-server-ui.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['core/**/*.ts'],
      exclude: [
        'core/**/*.d.ts',
        'core/types/**/*',
        'vite-plugin/**/*',
      ],
    },
  },
});
