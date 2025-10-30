import { Player } from "@minecraft/server";
import { PlayerRegistry } from "../entity/player";

export enum EventPriority {
  LOWEST, LOW, NORMAL, HIGH, HIGHEST, MONITOR
}

export interface Listener {}

/**
 * イベントオブジェクト全体をラップ。
 * player, source, target, attacker, victim 等を自動ラップ。
 */
function event2WrapedEvent<T extends object>(event: T): T {
  return new Proxy(event as any, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      // === Player to KeystonePlayer ===
      if (value instanceof Player && PlayerRegistry.findByPlayer(value)) {
        return PlayerRegistry.fromPlayer(value);
      }
      if (Array.isArray(value) && value.some(v => v instanceof Player)) {
        return value.map(v => {
          if (v instanceof Player && PlayerRegistry.findByPlayer(v)) {
            return PlayerRegistry.fromPlayer(v);
          }
          return v;
        });
      }

      return value;
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