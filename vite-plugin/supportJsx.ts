import type { Plugin } from 'vite';

const supportJsx = (): Plugin => ({
  name: 'SupportJsx',
  config: () => {
    return {
      esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'keystonemc/form',
      },
    };
  },
});

export default supportJsx;
