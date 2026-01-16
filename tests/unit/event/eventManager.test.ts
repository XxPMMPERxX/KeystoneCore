import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventManager } from '@/event/eventManager';
import { Priority } from '@/event/types';
import { world } from '@minecraft/server';
import { resetAllMocks } from '../../mocks/test-utils';

describe('EventManager', () => {
  beforeEach(() => {
    resetAllMocks();
    EventManager.clearAllListeners();
  });

  describe('registerAfter', () => {
    it('afterEventsにリスナーを登録できる', () => {
      const handler = vi.fn();

      EventManager.registerAfter('playerJoin', {
        handler,
        priority: Priority.NORMAL,
      });

      // world.afterEvents.playerJoin のイベントをトリガー
      const subscribeCall = world.afterEvents.playerJoin.subscribe.mock.calls[0];
      expect(subscribeCall).toBeDefined();

      // subscribeに渡されたコールバックを実行
      const eventCallback = subscribeCall[0];
      const mockEvent = { player: { name: 'TestPlayer' } };
      eventCallback(mockEvent);

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

      // イベントをトリガー
      const subscribeCall = world.afterEvents.playerJoin.subscribe.mock.calls[0];
      const eventCallback = subscribeCall[0];
      const mockEvent = { player: { name: 'TestPlayer' } };
      eventCallback(mockEvent);

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

      // イベントをトリガー
      const subscribeCall = world.afterEvents.playerJoin.subscribe.mock.calls[0];
      const eventCallback = subscribeCall[0];
      eventCallback({});

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

      // イベントをトリガー
      const subscribeCall = world.afterEvents.playerJoin.subscribe.mock.calls[0];
      const eventCallback = subscribeCall[0];
      eventCallback({});

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

      // world.beforeEvents.playerBreakBlock のイベントをトリガー
      const subscribeCall = world.beforeEvents.playerBreakBlock.subscribe.mock.calls[0];
      expect(subscribeCall).toBeDefined();

      // subscribeに渡されたコールバックを実行
      const eventCallback = subscribeCall[0];
      const mockEvent = { player: { name: 'TestPlayer' }, block: {} };
      eventCallback(mockEvent);

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

      // イベントをトリガー
      const subscribeCall = world.beforeEvents.playerBreakBlock.subscribe.mock.calls[0];
      const eventCallback = subscribeCall[0];
      eventCallback({});

      // 優先度: HIGHEST(1) > NORMAL(3) > MONITOR(0)
      // MONITOR が最後に実行される
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

      // イベントをトリガー
      const subscribeCall = world.afterEvents.playerJoin.subscribe.mock.calls[0];
      const eventCallback = subscribeCall[0];
      eventCallback({});

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

      // イベントをトリガー
      const afterSubscribeCall = world.afterEvents.playerJoin.subscribe.mock.calls[0];
      const afterEventCallback = afterSubscribeCall[0];
      afterEventCallback({});

      const beforeSubscribeCall = world.beforeEvents.playerBreakBlock.subscribe.mock.calls[0];
      const beforeEventCallback = beforeSubscribeCall[0];
      beforeEventCallback({});

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
        handler: (event) => {
          welcomeMessage(event.player?.name);
        },
        priority: Priority.HIGH,
      });

      // ログ記録（優先度: MONITOR）
      EventManager.registerAfter('playerJoin', {
        handler: (event) => {
          logJoin(event.player?.name);
        },
        priority: Priority.MONITOR,
      });

      // イベントをトリガー
      const subscribeCall = world.afterEvents.playerJoin.subscribe.mock.calls[0];
      const eventCallback = subscribeCall[0];
      eventCallback({ player: { name: 'Alice' } });

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
