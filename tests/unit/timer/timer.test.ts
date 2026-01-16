import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  RepeatingTimer,
  DelayedTimer,
  UntilTimer,
  repeating,
  delayed,
  sleep,
  until,
  waitUntil,
} from '@/timer/timer';
import { system } from '@minecraft/server';
import { tickSystem, resetAllMocks } from '../../mocks/test-utils';

describe('Timer', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('RepeatingTimer', () => {
    it('repeating() で定期的にコールバックを実行できる', () => {
      const callback = vi.fn();
      const timer = repeating({
        every: 5,
        run: callback,
      });

      // 5 tick経過
      tickSystem(5);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(5);

      // さらに5 tick経過
      tickSystem(10);
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(10);
    });

    it('max オプションで最大実行回数を指定できる', () => {
      const callback = vi.fn();
      const finalCallback = vi.fn();

      const timer = repeating({
        every: 1,
        run: callback,
        max: 3,
        final: finalCallback,
      });

      // 3 tick経過
      tickSystem(3);
      expect(callback).toHaveBeenCalledTimes(3);
      expect(finalCallback).toHaveBeenCalledTimes(1);

      // さらに進めても呼ばれない
      tickSystem(5);
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('cancel() でタイマーをキャンセルできる', () => {
      const callback = vi.fn();
      const cancelCallback = vi.fn();

      const timer = repeating({
        every: 1,
        run: callback,
        cancel: cancelCallback,
      });

      // 2 tick経過
      tickSystem(2);
      expect(callback).toHaveBeenCalledTimes(2);

      // キャンセル
      timer.cancel();
      tickSystem(3);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(cancelCallback).toHaveBeenCalledTimes(1);
    });

    it('stop() と resume() でタイマーを一時停止・再開できる', () => {
      const callback = vi.fn();

      const timer = repeating({
        every: 1,
        run: callback,
      });

      // 2 tick経過
      tickSystem(2);
      expect(callback).toHaveBeenCalledTimes(2);

      // 停止
      timer.stop();
      tickSystem(5);
      expect(callback).toHaveBeenCalledTimes(2); // 停止中なので呼ばれない

      // 再開
      timer.resume();
      tickSystem(7);
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('isStopped() で停止状態を確認できる', () => {
      const timer = repeating({
        every: 1,
        run: () => {},
      });

      expect(timer.isStopped()).toBe(false);

      timer.stop();
      expect(timer.isStopped()).toBe(true);

      timer.resume();
      expect(timer.isStopped()).toBe(false);
    });

    it('runWhileStopped オプションで停止中でも実行できる', () => {
      const callback = vi.fn();

      const timer = repeating({
        every: 1,
        run: callback,
        runWhileStopped: true,
      });

      // 2 tick経過
      tickSystem(2);
      expect(callback).toHaveBeenCalledTimes(2);

      // 停止
      timer.stop();
      tickSystem(5);
      // runWhileStopped が true なので停止中でも実行される
      expect(callback).toHaveBeenCalledTimes(5);
    });
  });

  describe('DelayedTimer', () => {
    it('delayed() で指定tick後にコールバックを実行できる', () => {
      const callback = vi.fn();

      delayed(10, callback);

      // 9 tick経過（まだ実行されない）
      tickSystem(9);
      expect(callback).not.toHaveBeenCalled();

      // 10 tick経過（実行される）
      tickSystem(10);
      expect(callback).toHaveBeenCalledTimes(1);

      // さらに進めても1回だけ
      tickSystem(20);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('cancel() でタイマーをキャンセルできる', () => {
      const callback = vi.fn();
      const cancelCallback = vi.fn();

      const timer = delayed(10, callback, cancelCallback);

      // 5 tick経過
      tickSystem(5);
      expect(callback).not.toHaveBeenCalled();

      // キャンセル
      timer.cancel();
      tickSystem(15);

      expect(callback).not.toHaveBeenCalled();
      expect(cancelCallback).toHaveBeenCalledTimes(1);
    });

    it('sleep() で指定tick後にresolveされる', async () => {
      const promise = sleep(5);
      let resolved = false;

      promise.then(() => {
        resolved = true;
      });

      // 4 tick経過（まだresolveされない）
      tickSystem(4);
      expect(resolved).toBe(false);

      // 5 tick経過（resolveされる）
      tickSystem(5);
      await promise;
      expect(resolved).toBe(true);
    });
  });

  describe('UntilTimer', () => {
    it('until() で条件が満たされるまで待機できる', () => {
      let count = 0;
      const condition = () => count >= 5;
      const callback = vi.fn();

      until({
        when: condition,
        run: callback,
        every: 1,
      });

      // 4 tick経過（条件が満たされない）
      for (let i = 0; i < 4; i++) {
        count++;
        tickSystem(i + 1);
      }
      expect(callback).not.toHaveBeenCalled();

      // 5 tick経過（条件が満たされる）
      count++;
      tickSystem(5);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('timeout オプションでタイムアウトを設定できる', () => {
      const condition = () => false; // 常にfalse
      const callback = vi.fn();
      const timeoutCallback = vi.fn();

      until({
        when: condition,
        run: callback,
        every: 1,
        timeout: 10,
        onTimeout: timeoutCallback,
      });

      // 9 tick経過（まだタイムアウトしない）
      tickSystem(9);
      expect(callback).not.toHaveBeenCalled();
      expect(timeoutCallback).not.toHaveBeenCalled();

      // 10 tick経過（タイムアウト）
      tickSystem(10);
      expect(callback).not.toHaveBeenCalled();
      expect(timeoutCallback).toHaveBeenCalledTimes(1);
    });

    it('cancel() でタイマーをキャンセルできる', () => {
      const condition = () => false;
      const callback = vi.fn();
      const cancelCallback = vi.fn();

      const timer = until({
        when: condition,
        run: callback,
        every: 1,
        cancel: cancelCallback,
      });

      // 3 tick経過
      tickSystem(3);

      // キャンセル
      timer.cancel();
      tickSystem(5);

      expect(callback).not.toHaveBeenCalled();
      expect(cancelCallback).toHaveBeenCalledTimes(1);
    });

    it('stop() でタイマーを一時停止できる', () => {
      let count = 0;
      const condition = () => count >= 5;
      const callback = vi.fn();

      const timer = until({
        when: condition,
        run: callback,
        every: 1,
      });

      // 2 tick経過
      count = 2;
      tickSystem(2);

      // 停止
      timer.stop();
      count = 10; // 条件を満たす値にする
      tickSystem(5);
      expect(callback).not.toHaveBeenCalled(); // 停止中なので実行されない

      // 再開
      timer.resume();
      tickSystem(6);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('waitUntil() で条件が満たされるまで待機できる', async () => {
      let count = 0;
      const condition = () => count >= 3;

      const promise = waitUntil(condition, { every: 1 });

      // 2 tick経過
      count = 2;
      tickSystem(2);

      // 3 tick経過（条件が満たされる）
      count = 3;
      tickSystem(3);

      const result = await promise;
      expect(result).toBe(true);
    });

    it('waitUntil() でタイムアウトした場合はfalseを返す', async () => {
      const condition = () => false; // 常にfalse

      const promise = waitUntil(condition, {
        every: 1,
        timeout: 5,
      });

      // 5 tick経過（タイムアウト）
      tickSystem(5);

      const result = await promise;
      expect(result).toBe(false);
    });
  });
});
