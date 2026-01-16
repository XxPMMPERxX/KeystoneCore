import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventManager } from '@/event/eventManager';
import { Priority } from '@/event/types';
import { world } from '../../mocks/minecraft-server';

describe('EventManager', () => {
  beforeEach(() => {
    // EventManager は モジュールロード時に world.afterEvents/beforeEvents に subscribe しているため、
    // world.__clearAllEvents() を呼ぶと EventManager のハンドラも消えてしまう。
    // そのため、ここでは EventManager.clearAllListeners() のみを呼ぶ。
    vi.clearAllMocks();
    EventManager.clearAllListeners();
  });

  describe('registerAfter', () => {
    it('afterEventsにリスナーを登録できる', () => {
      const handler = vi.fn();

      EventManager.registerAfter('playerJoin', {
        handler,
        priority: Priority.NORMAL,
      });

      // イベントをディスパッチ
      const mockEvent = { player: { name: 'TestPlayer' } };
      (world.afterEvents.playerJoin as any).__dispatch(mockEvent);

      // ハンドラが呼ばれることを確認
      expect(handler).toHaveBeenCalledWith(mockEvent);
    });

    it('複数のリスナーを登録できる', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      EventManager.registerAfter('playerJoin', {
        handler: handler1,
        priority: Priority.NORMAL,
      });

      EventManager.registerAfter('playerJoin', {
        handler: handler2,
        priority: Priority.HIGH,
      });

      // イベントをディスパッチ
      const mockEvent = { player: { name: 'TestPlayer' } };
      (world.afterEvents.playerJoin as any).__dispatch(mockEvent);

      expect(handler1).toHaveBeenCalledWith(mockEvent);
      expect(handler2).toHaveBeenCalledWith(mockEvent);
    });

    it('優先度の高い順にリスナーが実行される', () => {
      const executionOrder: string[] = [];

      EventManager.registerAfter('playerJoin', {
        handler: () => executionOrder.push('NORMAL'),
        priority: Priority.NORMAL,
      });

      EventManager.registerAfter('playerJoin', {
        handler: () => executionOrder.push('HIGH'),
        priority: Priority.HIGH,
      });

      EventManager.registerAfter('playerJoin', {
        handler: () => executionOrder.push('LOW'),
        priority: Priority.LOW,
      });

      EventManager.registerAfter('playerJoin', {
        handler: () => executionOrder.push('HIGHEST'),
        priority: Priority.HIGHEST,
      });

      // イベントをディスパッチ
      (world.afterEvents.playerJoin as any).__dispatch({});

      // 優先度: HIGHEST(1) > HIGH(2) > NORMAL(3) > LOW(4)
      expect(executionOrder).toEqual(['HIGHEST', 'HIGH', 'NORMAL', 'LOW']);
    });

    it('優先度を指定しない場合はNORMALとして扱われる', () => {
      const executionOrder: string[] = [];

      EventManager.registerAfter('playerJoin', {
        handler: () => executionOrder.push('NO_PRIORITY'),
      });

      EventManager.registerAfter('playerJoin', {
        handler: () => executionOrder.push('HIGH'),
        priority: Priority.HIGH,
      });

      EventManager.registerAfter('playerJoin', {
        handler: () => executionOrder.push('LOW'),
        priority: Priority.LOW,
      });

      // イベントをディスパッチ
      (world.afterEvents.playerJoin as any).__dispatch({});

      // NO_PRIORITY は NORMAL として扱われる
      expect(executionOrder).toEqual(['HIGH', 'NO_PRIORITY', 'LOW']);
    });
  });

  describe('registerBefore', () => {
    it('beforeEventsにリスナーを登録できる', () => {
      const handler = vi.fn();

      EventManager.registerBefore('playerBreakBlock', {
        handler,
        priority: Priority.NORMAL,
      });

      // イベントをディスパッチ
      const mockEvent = { player: { name: 'TestPlayer' }, block: {} };
      (world.beforeEvents.playerBreakBlock as any).__dispatch(mockEvent);

      // ハンドラが呼ばれることを確認
      expect(handler).toHaveBeenCalledWith(mockEvent);
    });

    it('優先度の高い順にリスナーが実行される', () => {
      const executionOrder: string[] = [];

      EventManager.registerBefore('playerBreakBlock', {
        handler: () => executionOrder.push('NORMAL'),
        priority: Priority.NORMAL,
      });

      EventManager.registerBefore('playerBreakBlock', {
        handler: () => executionOrder.push('HIGHEST'),
        priority: Priority.HIGHEST,
      });

      EventManager.registerBefore('playerBreakBlock', {
        handler: () => executionOrder.push('MONITOR'),
        priority: Priority.MONITOR,
      });

      // イベントをディスパッチ
      (world.beforeEvents.playerBreakBlock as any).__dispatch({});

      // 優先度: HIGHEST(1) > NORMAL(3) > MONITOR(0)
      // MONITOR(0) が最も高い数値なので最後に実行される
      expect(executionOrder).toEqual(['HIGHEST', 'NORMAL', 'MONITOR']);
    });
  });

  describe('エラーハンドリング', () => {
    it('リスナーがエラーを投げても他のリスナーは実行される', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const handler1 = vi.fn(() => {
        throw new Error('Test error');
      });
      const handler2 = vi.fn();

      EventManager.registerAfter('playerJoin', {
        handler: handler1,
        priority: Priority.HIGH,
      });

      EventManager.registerAfter('playerJoin', {
        handler: handler2,
        priority: Priority.LOW,
      });

      // イベントをディスパッチ
      (world.afterEvents.playerJoin as any).__dispatch({});

      // handler1 はエラーを投げるが、handler2 は実行される
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearAllListeners', () => {
    it('登録済みのリスナーをすべてクリアできる', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      EventManager.registerAfter('playerJoin', {
        handler: handler1,
      });

      EventManager.registerBefore('playerBreakBlock', {
        handler: handler2,
      });

      // クリア
      EventManager.clearAllListeners();

      // イベントをディスパッチ
      (world.afterEvents.playerJoin as any).__dispatch({});
      (world.beforeEvents.playerBreakBlock as any).__dispatch({});

      // ハンドラは呼ばれない
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('実用例', () => {
    it('プレイヤー参加イベントを処理できる', () => {
      const welcomeMessage = vi.fn();
      const logJoin = vi.fn();

      // ウェルカムメッセージ（優先度: HIGH）
      EventManager.registerAfter('playerJoin', {
        handler: (event: any) => {
          welcomeMessage(event.player?.name);
        },
        priority: Priority.HIGH,
      });

      // ログ記録（優先度: MONITOR）
      EventManager.registerAfter('playerJoin', {
        handler: (event: any) => {
          logJoin(event.player?.name);
        },
        priority: Priority.MONITOR,
      });

      // イベントをディスパッチ
      (world.afterEvents.playerJoin as any).__dispatch({ player: { name: 'Alice' } });

      // 両方のハンドラが実行される
      expect(welcomeMessage).toHaveBeenCalledWith('Alice');
      expect(logJoin).toHaveBeenCalledWith('Alice');

      // ウェルカムメッセージが先に実行される
      expect(welcomeMessage.mock.invocationCallOrder[0]).toBeLessThan(
        logJoin.mock.invocationCallOrder[0]
      );
    });
  });
});
