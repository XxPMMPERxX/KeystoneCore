import type { UserConfig } from 'vite';
import { resolve } from 'path';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';

type PluginConfig = {
  name: string,
  uuid?: string,
  description?: string,
  authors?: string[],
  version?: number[],
};

const behaviorPacker = ({
  name = 'my first plugin',
  uuid,
  description = '',
  authors = [],
  version = [1, 0, 0]
 }: PluginConfig = {
  name: 'my first plugin',
  description: '',
  authors: [],
  version: [1, 0, 0]
 }) => ({
  name: 'BehaviorPacker',
  config: (config: UserConfig) => {
    return {
      ...config,
      build: {
        outDir: './dist_behavior_pack/scripts',
        emptyOutDir: true,
        assetsDir: '',
        rollupOptions: {
          external: [
            '@minecraft/server',
            '@minecraft/server-net',
            '@minecraft/server-ui',
          ],
          input: {
            index: resolve(__dirname, './src/index.ts'),
          },
        },
      },
    }
  },
  writeBundle: async (_: any, outputFiles: { isEntry: boolean, fileName: string }[]) => {
    const entryFile = Object.values(outputFiles).find(({ isEntry }) => isEntry);

    if (!entryFile) {
      throw new Error();
    }

    const behaviorUUID = uuid ?? crypto.randomUUID();
    const manifestStub = {
      "format_version": 2,
      "header": {
        "name": name,
        "description": description,
        "uuid": behaviorUUID,
        "version": version,
        "min_engine_version": [1, 21, 120]
      },
      "modules": [
        {
          "description": "script",
          "type": "script",
          "language": "javascript",
          "uuid": crypto.randomUUID(),
          "version": [1, 0, 0],
          "entry": `scripts/${entryFile.fileName}`,
        }
      ],
      "dependencies": [
        {
          "module_name":"@minecraft/server",
          "version": "beta"
        },
        {
          "module_name": "@minecraft/server-ui",
          "version": "beta"
        },
        {
          "module_name": "@minecraft/server-net",
          "version": "beta"
        }
      ],
      "metadata": {
        "authors": authors,
      }
    };

    fs.writeFileSync('./dist_behavior_pack/manifest.json', JSON.stringify(manifestStub, null, 2));
  },
});

export default behaviorPacker;
