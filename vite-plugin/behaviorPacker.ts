import type { Plugin } from 'vite';
import type { OutputBundle, NormalizedOutputOptions } from 'rollup';
import { resolve } from 'path';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';

type PluginConfig = {
  name: string,
  uuid?: string,
  description?: string,
  authors?: string[],
  version?: number[],
  embedSourceMap?: boolean,
};

const behaviorPacker = ({
  name = 'my first plugin',
  uuid,
  description = '',
  authors = [],
  version = [1, 0, 0],
  embedSourceMap = true,
}: PluginConfig = {
  name: 'my first plugin',
  description: '',
  authors: [],
  version: [1, 0, 0],
  embedSourceMap: true,
}): Plugin => ({
  name: 'BehaviorPacker',
  
  config: () => {
    return {
      build: {
        sourcemap: true,
        minify: false,
        outDir: 'dist/behavior_pack/scripts',
        emptyOutDir: true,
        assetsDir: '',
        rollupOptions: {
          external: [
            '@minecraft/server',
            '@minecraft/server-net',
            '@minecraft/server-ui',
          ],
          input: {
            index: resolve(process.cwd(), './src/index.ts'),
          },
        },
      },
    };
  },

  generateBundle(options: NormalizedOutputOptions, bundle: OutputBundle) {
    if (!embedSourceMap) return;

    // バンドル内のチャンクとソースマップを処理
    for (const [, file] of Object.entries(bundle)) {
      if (file.type === 'chunk' && file.map) {
        const sourceMapData = file.map;
        
        const embeddedSourceMap = {
          version: sourceMapData.version,
          sources: sourceMapData.sources,
          sourcesContent: sourceMapData.sourcesContent,
          mappings: sourceMapData.mappings,
          names: sourceMapData.names,
          _offset: 4, // 埋め込みコードで追加される行数（4行）
        };

        // ソースマップをグローバル変数として埋め込む
        const sourceMapEmbed = `// ========== Embedded Source Map ==========
globalThis.__SOURCE_MAP__ = ${JSON.stringify(embeddedSourceMap)};
// ========== End of Embedded Source Map ==========

`;

        // コードを修正
        const originalCode = file.code;
        const modifiedCode = sourceMapEmbed + originalCode;
        // 外部ソースマップURLコメントを削除
        file.code = modifiedCode.replace(/\/\/# sourceMappingURL=.+$/gm, '');
        
        // ソースマップファイルを削除（埋め込み済みなので不要）
        file.map = null;
      }
    }

    // .mapファイルを削除
    for (const fileName in bundle) {
      if (fileName.endsWith('.map')) {
        delete bundle[fileName];
      }
    }
  },

  writeBundle: async (_options: NormalizedOutputOptions, bundle: OutputBundle) => {
    const entryFile = Object.values(bundle).find(
      (file) => file.type === 'chunk' && file.isEntry
    );

    if (!entryFile || entryFile.type !== 'chunk') {
      throw new Error('No entry file found');
    }

    const behaviorUUID = uuid ?? crypto.randomUUID();
    const manifestStub = {
      'format_version': 2,
      'header': {
        'name': name,
        'description': description,
        'uuid': behaviorUUID,
        'version': version,
        'min_engine_version': [1, 21, 120]
      },
      'modules': [
        {
          'description': 'script',
          'type': 'script',
          'language': 'javascript',
          'uuid': crypto.randomUUID(),
          'version': [1, 0, 0],
          'entry': `scripts/${entryFile.fileName}`,
        }
      ],
      'dependencies': [
        {
          'module_name': '@minecraft/server',
          'version': '2.4.0'
        },
        {
          'module_name': '@minecraft/server-ui',
          'version': '2.0.0'
        },
      ],
      'metadata': {
        'authors': authors,
      }
    };

    fs.writeFileSync('./dist/behavior_pack/manifest.json', JSON.stringify(manifestStub, null, 2));
  },
});

export default behaviorPacker;
