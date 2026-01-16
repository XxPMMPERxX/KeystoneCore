import { world } from '@minecraft/server';
import { Listener, Priority } from './types';

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

// Partial を使って never 問題を回避（各キー毎の型情報を保持）
const afterListeners: Partial<{ [K in AfterEventName]: Listener<AfterEventMap[K]>[] }> = {};
const beforeListeners: Partial<{ [K in BeforeEventName]: Listener<BeforeEventMap[K]>[] }> = {};

// world.beforeEvents / world.afterEvents を全自動で subscribe して dispatch に流す
// afterEvents
for (const name in world.afterEvents) {
  const eventName = name as AfterEventName;
  const eventSignal = world.afterEvents[eventName];
  eventSignal.subscribe((ev) => {
    dispatchAfter(eventName, ev);
  });
}

// beforeEvents
for (const name in world.beforeEvents) {
  const eventName = name as BeforeEventName;
  const eventSignal = world.beforeEvents[eventName];
  eventSignal.subscribe((ev) => {
    dispatchBefore(eventName, ev);
  });
}

// ---------- register ----------
function registerAfter<K extends AfterEventName>(eventName: K, listener: Listener<AfterEventMap[K]>) {
  if (!afterListeners[eventName]) {
    afterListeners[eventName] = [];
  }
  const arr = afterListeners[eventName]!;
  arr.push(listener as Listener<any>);
  // 優先度の値が小さいほど先に実行される（HIGHEST=1 が最初）
  arr.sort((a, b) => (a.priority ?? Priority.NORMAL) - (b.priority ?? Priority.NORMAL));
}

function registerBefore<K extends BeforeEventName>(eventName: K, listener: Listener<BeforeEventMap[K]>) {
  if (!beforeListeners[eventName]) {
    beforeListeners[eventName] = [];
  }
  const arr = beforeListeners[eventName]!;
  arr.push(listener as Listener<any>);
  // 優先度の値が小さいほど先に実行される（HIGHEST=1 が最初）
  arr.sort((a, b) => (a.priority ?? Priority.NORMAL) - (b.priority ?? Priority.NORMAL));
}

// ---------- dispatch ----------
function dispatchAfter<K extends AfterEventName>(eventName: K, event: AfterEventMap[K]) {
  const arr = afterListeners[eventName];
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

function dispatchBefore<K extends BeforeEventName>(eventName: K, event: BeforeEventMap[K]) {
  const arr = beforeListeners[eventName];
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
function clearAllListeners() {
  for (const key in afterListeners) {
    delete afterListeners[key as AfterEventName];
  }
  for (const key in beforeListeners) {
    delete beforeListeners[key as BeforeEventName];
  }
}

// ---------- namespace object ----------
/** EventManager オブジェクトとしてまとめてエクスポート */
export const EventManager = {
  registerAfter,
  registerBefore,
  clearAllListeners
};
