import { Player, system } from "@minecraft/server";
import { listen } from "./event";

interface WaitForOptions {
  timeout?: number;
  onTimeout?: () => void;
  resolveOnTimeout?: boolean;
}

const activeListeners = new Set<(ev: any) => void>();
const runningFlows = new Map<string, Promise<void>>();

/**
 * イベントを条件付きで待機（タイムアウト付き）
 */
export function waitFor<T extends object>(
  predicate: (event: T) => boolean,
  options?: WaitForOptions
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let done = false;
    let timeoutId: number | undefined;

    const handler = (event: T) => {
      if (done) return;
      try {
        if (predicate(event)) {
          done = true;
          clearTimeout(timeoutId);
          activeListeners.delete(handler);
          resolve(event);
        }
      } catch (e) {
        console.error('[waitFor] predicate error:', e);
      }
    };

    if (options?.timeout) {
      timeoutId = system.runTimeout(() => {
        if (done) return;
        done = true;
        activeListeners.delete(handler);
        options?.onTimeout?.();
        if (options?.resolveOnTimeout) {
          resolve(null as any);
        } else {
          reject(new Error('waitFor: timeout'));
        }
      }, options.timeout / 50); // tick換算
    }

    activeListeners.add(handler);
  });
}

/**
 * イベントオブジェクトから Player インスタンスを探索
 * ネストされたオブジェクト・配列にも対応
 */
function extractPlayersFromEvent(event: any): Player[] {
  const found = new Set<Player>();

  const search = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;

    if (obj instanceof Player) {
      found.add(obj);
      return;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) search(item);
    } else {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        // 循環参照防止のため try/catch
        try {
          search(value);
        } catch {}
      }
    }
  };

  search(event);
  return [...found];
}

/**
 * 複数イベントを束ねて非同期フローを開始
 * すべてのイベントで、Player を自動検出
 */
export function flowListen(...args: any[]): void {
  const flowFn = args.pop();
  const eventSources = args;

  for (const src of eventSources) {
    listen(src, async (event) => {
      // すべての waitFor() にイベントを流す
      for (const handler of activeListeners) {
        handler(event);
      }

      // イベント内に含まれる全ての Player を探索
      const players = extractPlayersFromEvent(event);
      if (players.length === 0) return;

      for (const player of players) {
        if (runningFlows.has(player.id)) continue;

        const runner = (async () => {
          try {
            await flowFn(player, event); // eventも渡すように
          } catch (e) {
            console.error(`[flowListen:${player.name}]`, e);
          } finally {
            runningFlows.delete(player.id);
          }
        })();

        runningFlows.set(player.id, runner);
      }
    });
  }
}
