import { Player } from "@minecraft/server";
import { PlayerRegistry } from "../entity/player";

/**
 * 値を再帰的に走査して Player → KeystonePlayer に変換
 */
function wrapValue(value: any): any {
  // Player単体の場合
  if (value instanceof Player && PlayerRegistry.findByPlayer(value)) {
    return PlayerRegistry.fromPlayer(value);
  }

  // 配列の場合
  if (Array.isArray(value)) {
    return value.map(v => wrapValue(v));
  }

  // オブジェクト（null除外）で、Playerをプロパティに含む場合
  if (value && typeof value === "object" && !(value instanceof Player)) {
    return new Proxy(value, {
      get(target, prop, receiver) {
        const v = Reflect.get(target, prop, receiver);
        return wrapValue(v); // 再帰
      },
    });
  }

  // それ以外はそのまま
  return value;
}

/**
 * イベント全体を再帰的にラップ
 */
function event2WrapedEvent<T extends object>(event: T): T {
  return new Proxy(event, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      return wrapValue(value);
    },
  });
}

/**
 * @template E イベント
 * @param {E} eventSource 
 * @param {(event: E) => void} handler
 * @example eventListener.ts
 * ```typescript
 * import { PlayerButtonInputAfterEvent, world } from "@minecraft/server";
 *
 * listen(world.afterEvents.playerButtonInput, (event: PlayerButtonInputAfterEvent) => {
 *   event.player.sendMessage("This is button!!");
 * });
 * ```
 */
export function listen<E extends object>(
  eventSource: { subscribe: (cb: (event: E) => void) => void },
  handler: (event: E) => void
): void {
  eventSource.subscribe((event) => handler(event2WrapedEvent(event)));
}