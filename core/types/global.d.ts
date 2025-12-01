// global.d.ts
declare global {
  var __SOURCE_MAP__: {
    version: number;
    sources: string[];
    sourcesContent?: string[];
    mappings: string;
    names?: string[];
  } | undefined;
}

export {};
