import { system } from '@minecraft/server';

interface WaitForOptions {
  onInterval?: () => void;
  onTimeout?: () => void;
  interval?: number;
  timeout?: number;
  resolveOnInterval?: boolean;
  resolveOnTimeout?: boolean;
}

const activeListeners = new Set<(ev: any) => void>();

/**
 * イベントを条件付きで待機（タイムアウト付き）
 */
export function waitFor<T extends object>(
  predicate: (event: T) => boolean,
  options?: WaitForOptions
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let done = false;
    let intervalId: number | undefined;

    const handler = (event: T) => {
      if (done) return;
      try {
        if (predicate(event)) {
          done = true;
          resolve(event);
        }
      } catch (e) {
        console.error('[waitFor] predicate error:', e);
      }
    };

    if (options?.interval) {
      intervalId = system.runInterval(() => {
        if (done) return;
        options?.onInterval?.();
      }, options.interval);
    }

    if (options?.timeout) {
      system.runTimeout(() => {
        if (done) return;
        done = true;
        options?.onTimeout?.();
        if (intervalId) system.clearRun(intervalId);
        if (options?.resolveOnTimeout) {
          resolve(null as any);
        } else {
          reject(new Error('waitFor: timeout'));
        }
      }, options.timeout);
    }

    activeListeners.add(handler);
  });
}

/**
 * 複数イベントを束ねて非同期フローを開始
 * すべてのイベントで、Entityを自動検出
 */
export function flowListen<E extends object>(...args: any[]): void {
  const flowFn = args.pop();
  const eventSources: { subscribe: (cb: (event: E) => void) => void }[] = args;
  flowFn();

  for (const src of eventSources) {
    src.subscribe(async (event) => {
      for (const handler of activeListeners) {
        handler(event);
      }
    });
  }
}
