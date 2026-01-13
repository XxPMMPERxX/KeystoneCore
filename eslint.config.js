import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig({
  files: [
    'core/**/*.ts',
    'vite-plugin/**/*.ts',
  ],
  ignores: ['dev/**/*.ts'],
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommended,
  ],
  rules: {
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'semi': ['error', 'always'],
    '@typescript-eslint/no-explicit-any': 'off',
  },
});
