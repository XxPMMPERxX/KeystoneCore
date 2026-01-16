import { vi } from 'vitest';

/**
 * @minecraft/server のモック
 * KeystoneCore のテスト用モック実装
 */

// Vector3 モック（@minecraft/server の Vector3 型互換）
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Player モック
export class Player {
  name: string;
  id: string;

  constructor(name = 'TestPlayer', id = 'test-player-id') {
    this.name = name;
    this.id = id;
  }

  sendMessage = vi.fn((message: string) => {
    // メッセージ送信のモック
  });

  runCommand = vi.fn((command: string) => {
    return { successCount: 1 };
  });
}

// World モック
export class World {
  afterEvents = {
    playerJoin: { subscribe: vi.fn() },
    playerLeave: { subscribe: vi.fn() },
    playerSpawn: { subscribe: vi.fn() },
    itemUse: { subscribe: vi.fn() },
    entityHurt: { subscribe: vi.fn() },
    chatSend: { subscribe: vi.fn() },
  };

  beforeEvents = {
    playerBreakBlock: { subscribe: vi.fn() },
    playerPlaceBlock: { subscribe: vi.fn() },
    itemUse: { subscribe: vi.fn() },
    chatSend: { subscribe: vi.fn() },
  };

  getAllPlayers = vi.fn(() => {
    return [new Player()];
  });

  getPlayers = vi.fn(() => {
    return [new Player()];
  });

  sendMessage = vi.fn((message: string) => {
    // ワールドメッセージ送信のモック
  });
}

// System モック
export class System {
  private intervalId = 0;
  private timeoutId = 0;
  private intervals = new Map<number, { callback: () => void; tickInterval: number }>();
  private timeouts = new Map<number, { callback: () => void; tickDelay: number }>();

  runInterval = vi.fn((callback: () => void, tickInterval?: number) => {
    const id = ++this.intervalId;
    this.intervals.set(id, { callback, tickInterval: tickInterval ?? 1 });
    return id;
  });

  clearRun = vi.fn((runId: number) => {
    this.intervals.delete(runId);
    this.timeouts.delete(runId);
  });

  runTimeout = vi.fn((callback: () => void, tickDelay?: number) => {
    const id = ++this.timeoutId;
    this.timeouts.set(id, { callback, tickDelay: tickDelay ?? 1 });
    return id;
  });

  run = vi.fn((callback: () => void) => {
    const id = ++this.timeoutId;
    this.timeouts.set(id, { callback, tickDelay: 0 });
    return id;
  });

  // テスト用ヘルパー: 登録されたコールバックを実行
  __tickAll(ticks = 1) {
    // Intervals を実行
    this.intervals.forEach(({ callback, tickInterval }) => {
      if (ticks % tickInterval === 0) {
        callback();
      }
    });

    // Timeouts を実行（一度だけ）
    this.timeouts.forEach(({ callback, tickDelay }, id) => {
      if (ticks >= tickDelay) {
        callback();
        this.timeouts.delete(id);
      }
    });
  }

  // テスト用ヘルパー: すべてのタイマーをクリア
  __clearAll() {
    this.intervals.clear();
    this.timeouts.clear();
    this.runInterval.mockClear();
    this.clearRun.mockClear();
    this.runTimeout.mockClear();
    this.run.mockClear();
  }
}

// シングルトンインスタンス
export const world = new World();
export const system = new System();

// テスト用ヘルパー: モックをリセット
export function resetMocks() {
  vi.clearAllMocks();
  system.__clearAll();
}
