/**
 * テスト用ユーティリティ
 * KeystoneCore のテストで使用する共通ヘルパー関数
 */

import { Player, system, world } from './minecraft-server';
import { vi } from 'vitest';

/**
 * テストプレイヤーを作成
 */
export function createTestPlayer(name = 'TestPlayer', id = 'test-player-id'): Player {
  return new Player(name, id);
}

/**
 * 複数のテストプレイヤーを作成
 */
export function createTestPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => new Player(`Player${i + 1}`, `player-${i + 1}`));
}

/**
 * システムタイマーをシミュレート
 * 指定したtick数だけ時間を進める
 */
export function tickSystem(ticks = 1): void {
  system.__tickAll(ticks);
}

/**
 * すべてのモックをリセット
 */
export function resetAllMocks(): void {
  vi.clearAllMocks();
  system.__clearAll();
}

/**
 * イベントリスナーをトリガー
 */
export function triggerEvent(
  eventType: 'after' | 'before',
  eventName: string,
  eventData: any = {}
): void {
  const events = eventType === 'after' ? world.afterEvents : world.beforeEvents;
  const eventObj = (events as any)[eventName];

  if (eventObj && eventObj.subscribe.mock.calls.length > 0) {
    // 登録されているすべてのリスナーを実行
    eventObj.subscribe.mock.calls.forEach(([callback]: any[]) => {
      callback(eventData);
    });
  }
}

/**
 * Vector3 の値が等しいかチェック
 */
export function expectVector3Equal(
  actual: { x: number; y: number; z: number },
  expected: { x: number; y: number; z: number },
  epsilon = 0.0001
): void {
  expect(Math.abs(actual.x - expected.x)).toBeLessThan(epsilon);
  expect(Math.abs(actual.y - expected.y)).toBeLessThan(epsilon);
  expect(Math.abs(actual.z - expected.z)).toBeLessThan(epsilon);
}
