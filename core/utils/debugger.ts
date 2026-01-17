// ANSIカラー定義
const COLOR = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

// ──────────────────────────────
// VLQ デコーダー
// ──────────────────────────────
class VLQDecoder {
  private static readonly BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  static decode(str: string): number[] {
    const result: number[] = [];
    let shift = 0;
    let value = 0;

    for (let i = 0; i < str.length; i++) {
      const digit = this.BASE64_CHARS.indexOf(str[i]);
      if (digit === -1) continue;

      const continuation = (digit & 32) !== 0;
      value += (digit & 31) << shift;

      if (continuation) {
        shift += 5;
      } else {
        const negative = (value & 1) !== 0;
        value >>>= 1;
        result.push(negative ? -value : value);
        value = 0;
        shift = 0;
      }
    }

    return result;
  }
}

// ──────────────────────────────
// ソースマップデコーダー
// ──────────────────────────────
interface Mapping {
  generatedLine: number;
  generatedColumn: number;
  originalLine: number;
  originalColumn: number;
  sourceIndex: number;
  name?: string;
}

class SourceMapDebugger {
  private sourceMap: any;
  private decodedMappings: Mapping[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof globalThis.__SOURCE_MAP__ !== 'undefined') {
      this.sourceMap = globalThis.__SOURCE_MAP__;
      this.decodeMappings();
      this.initialized = true;
    }
  }

  private decodeMappings() {
    if (!this.sourceMap?.mappings) return;

    const lines = this.sourceMap.mappings.split(';');
    let generatedLine = 1;
    let prevOriginalLine = 0;
    let prevOriginalColumn = 0;
    let prevSource = 0;
    let prevName = 0;

    for (const line of lines) {
      if (!line) {
        generatedLine++;
        continue;
      }

      const segments = line.split(',');
      let generatedColumn = 0;

      for (const segment of segments) {
        if (!segment) continue;

        const decoded = VLQDecoder.decode(segment);
        if (decoded.length < 1) continue;

        generatedColumn += decoded[0];

        const mapping: Mapping = {
          generatedLine,
          generatedColumn,
          originalLine: 0,
          originalColumn: 0,
          sourceIndex: 0,
        };

        if (decoded.length > 1) {
          prevSource += decoded[1];
          mapping.sourceIndex = prevSource;

          if (decoded.length > 2) {
            prevOriginalLine += decoded[2];
            mapping.originalLine = prevOriginalLine;

            if (decoded.length > 3) {
              prevOriginalColumn += decoded[3];
              mapping.originalColumn = prevOriginalColumn;

              if (decoded.length > 4) {
                prevName += decoded[4];
                mapping.name = this.sourceMap.names?.[prevName];
              }
            }
          }
        }

        this.decodedMappings.push(mapping);
      }

      generatedLine++;
    }
  }

  private getOriginalPosition(line: number, column?: number) {
    if (!this.initialized || this.decodedMappings.length === 0) return null;

    let best: Mapping | null = null;
    let bestDistance = Infinity;

    for (const m of this.decodedMappings) {
      if (m.generatedLine === line) {
        const distance = column !== undefined ? Math.abs(m.generatedColumn - column) : 0;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = m;
        }
      } else if (m.generatedLine < line) {
        if (!best || m.generatedLine > best.generatedLine) best = m;
      }
    }

    if (best && this.sourceMap.sources?.[best.sourceIndex]) {
      return {
        source: this.sourceMap.sources[best.sourceIndex],
        line: best.originalLine + 1, // ソースマップは0-indexedなので1を足す
        column: best.originalColumn + 1, // ソースマップは0-indexedなので1を足す
        content: this.sourceMap.sourcesContent?.[best.sourceIndex],
        name: best.name,
      };
    }

    return null;
  }

  debug(...args: any[]) {
    try {
      const err = new Error();
      const stack = err.stack || '';
      const stackLines = stack.split('\n');

      const output: string[] = [];
      output.push('');
      output.push(`${COLOR.yellow}━━━━━━━━━━━━━━━━━━━━━━${COLOR.reset}`);

      let position: ReturnType<typeof this.getOriginalPosition> = null;

      // スタックからファイル・行・列を解析
      const offset = (this.sourceMap?._offset as number) || 0;
      for (let i = 2; i < Math.min(stackLines.length, 8); i++) {
        const line = stackLines[i];
        const match = /(?:\()?(?:[A-Za-z0-9._/-]+):(\d+)(?::(\d+))?\)?$/.exec(line);
        if (match) {
          const rawLineNum = parseInt(match[1]);
          const lineNum = rawLineNum - offset; // 埋め込みコードのオフセットを補正
          const colNum = match[2] ? parseInt(match[2]) : undefined;
          position = this.getOriginalPosition(lineNum, colNum);
          if (position) break;
        }
      }

      if (position) {
        const file = position.source;
        output.push(`${COLOR.blue}${file}:${position.line}:${position.column}${COLOR.reset}`);
        if (position.name) output.push(`${COLOR.cyan}${position.name}${COLOR.reset}`);

        if (position.content) {
          const lines = position.content.split('\n');
          const target = position.line - 1;
          const range = 2;

          output.push(`${COLOR.gray}─────────────────────${COLOR.reset}`);

          for (let i = Math.max(0, target - range); i <= Math.min(lines.length - 1, target + range); i++) {
            const num = `${(i + 1).toString().padStart(3, ' ')}`;
            const content = lines[i];

            if (i === target) {
              output.push(`${COLOR.red}${COLOR.bold}→ ${num}: ${COLOR.white}${content}${COLOR.reset}`);
            } else {
              output.push(`${COLOR.gray}  ${num}: ${content}${COLOR.reset}`);
            }
          }
        }
      } else {
        output.push(`${COLOR.gray}Location: (source map not available)${COLOR.reset}`);
      }

      output.push(`${COLOR.gray}─────────────────────${COLOR.reset}`);
      output.push(`${COLOR.bold}${COLOR.white}Values:${COLOR.reset}`);

      args.forEach((arg, i) => {
        let val: string;
        if (arg === undefined) val = 'undefined';
        else if (arg === null) val = 'null';
        else if (typeof arg === 'object') {
          try {
            val = JSON.stringify(arg, null, 2);
          } catch {
            val = '[Circular or Complex Object]';
          }
        } else if (typeof arg === 'function') {
          val = `[Function: ${arg.name || 'anonymous'}]`;
        } else {
          val = String(arg);
        }
        output.push(`${COLOR.green}[${i}]:${COLOR.reset} ${val}`);
      });

      output.push(`${COLOR.yellow}━━━━━━━━━━━━━━━━━━━━━━${COLOR.reset}`);

      console.log(output.join('\n'));
    } catch (err) {
      console.log(`${COLOR.red}[DEBUG ERROR]${COLOR.reset}`, err);
      console.log(args);
    }
  }
}

// ──────────────────────────────
// export
// ──────────────────────────────
const debuggerInstance = new SourceMapDebugger();
export function debug(...args: any[]): void {
  debuggerInstance.debug(...args);
}
