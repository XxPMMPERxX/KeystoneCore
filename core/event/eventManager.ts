import { world } from "@minecraft/server";
import { Listener } from "./types";
import { Priority } from "./priority";

/**
 * AfterEventMap / BeforeEventMap を world.afterEvents / world.beforeEvents の
 * subscribe のハンドラ引数から自動抽出する。
 *
 * 例: world.afterEvents.playerSpawn.subscribe((ev: PlayerSpawnAfterEvent) => {...})
 *    の ev の型を自動的に E として取り出す。
 */
type ExtractSubscribeArg<T> = T extends { subscribe: (handler: (ev: infer E) => any) => any } ? E : never;

export type AfterEventMap = {
  [K in keyof typeof world.afterEvents]: ExtractSubscribeArg<(typeof world.afterEvents)[K]>;
};

export type BeforeEventMap = {
  [K in keyof typeof world.beforeEvents]: ExtractSubscribeArg<(typeof world.beforeEvents)[K]>;
};

type AfterEventName = keyof AfterEventMap;
type BeforeEventName = keyof BeforeEventMap;

export class EventManager {
  // Partial を使って never 問題を回避（各キー毎の型情報を保持）
  private static afterListeners: Partial<{ [K in AfterEventName]: Listener<AfterEventMap[K]>[] }> = {};
  private static beforeListeners: Partial<{ [K in BeforeEventName]: Listener<BeforeEventMap[K]>[] }> = {};

  /** init: world.beforeEvents / world.afterEvents を全自動で subscribe して dispatch に流す */
  static initialize() {
    // afterEvents
    for (const name in world.afterEvents) {
      (world.afterEvents as any)[name].subscribe((ev: any) => {
        EventManager.dispatchAfter(name as AfterEventName, ev);
      });
    }

    // beforeEvents
    for (const name in world.beforeEvents) {
      (world.beforeEvents as any)[name].subscribe((ev: any) => {
        EventManager.dispatchBefore(name as BeforeEventName, ev);
      });
    }
  }

  // ---------- register ----------
  static registerAfter<K extends AfterEventName>(eventName: K, listener: Listener<AfterEventMap[K]>) {
    if (!this.afterListeners[eventName]) {
      this.afterListeners[eventName] = [];
    }
    const arr = this.afterListeners[eventName]!;
    arr.push(listener as Listener<any>);
    arr.sort((a, b) => (b.priority ?? Priority.NORMAL) - (a.priority ?? Priority.NORMAL));
  }

  static registerBefore<K extends BeforeEventName>(eventName: K, listener: Listener<BeforeEventMap[K]>) {
    if (!this.beforeListeners[eventName]) {
      this.beforeListeners[eventName] = [];
    }
    const arr = this.beforeListeners[eventName]!;
    arr.push(listener as Listener<any>);
    arr.sort((a, b) => (b.priority ?? Priority.NORMAL) - (a.priority ?? Priority.NORMAL));
  }

  // ---------- dispatch ----------
  private static dispatchAfter<K extends AfterEventName>(eventName: K, event: AfterEventMap[K]) {
    const arr = this.afterListeners[eventName];
    if (!arr) return;
    for (const listener of arr) {
      try {
        listener.handler(event as any);
      } catch (e) {
        // エラーは個別に捕捉して続行（必要ならログ機構を入れてください）
        console.error(`[EventManager] after:${String(eventName)} handler threw:`, e);
      }
    }
  }

  private static dispatchBefore<K extends BeforeEventName>(eventName: K, event: BeforeEventMap[K]) {
    const arr = this.beforeListeners[eventName];
    if (!arr) return;
    for (const listener of arr) {
      try {
        listener.handler(event as any);
      } catch (e) {
        console.error(`[EventManager] before:${String(eventName)} handler threw:`, e);
      }
    }
  }

  // ---------- utility ----------
  /** 登録済みリスナーを全部クリア（Plugin 単位で実装するなら拡張する） */
  private static clearAll() {
    this.afterListeners = {};
    this.beforeListeners = {};
  }
}
