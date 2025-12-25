import { system } from '@minecraft/server';

/**
 * タイマーの基底クラス
 */
abstract class BaseTimer {
  /** キャンセル済みかどうか */
  protected canceled = false;

  /** onCancel() を呼ばない強制キャンセルかどうか */
  protected forceCanceled = false;

  /** 停止中かどうか */
  protected stopped = false;

  /**
   * タイマーをキャンセルする
   */
  cancel(forceCanceled: boolean = false) {
    this.canceled = true;
    this.forceCanceled = forceCanceled;
  }

  /**
   * タイマーを一時停止する
   */
  stop() {
    this.stopped = true;
  }

  /**
   * タイマーが停止しているかどうか
   * @returns {boolean}
   */
  isStopped(): boolean {
    return this.stopped;
  }

  /**
   * 停止中のタイマーを再開する
   */
  resume() {
    this.stopped = false;
  }

  /**
   * タイマーを開始する
   */
  abstract start(): void;
}

/**
 * RepeatingTimerのオプション
 */
export interface RepeatingOptions {
  /** 実行周期 (tick) */
  period: number;

  /** 最大Tick（未指定の場合は無限） */
  max?: number;

  /** 停止中でも run() を呼ぶか */
  runWhileStopped?: boolean;

  /** 最大Tickに達したときに呼ばれるコールバック */
  onFinal?: () => void;
}

/**
 * 一定周期で処理を実行する繰り返しタイマー
 */
export class RepeatingTimer extends BaseTimer {
  /** 経過Tick数 */
  private elapsedTicks = 0;

  /** runIntervalの識別子 */
  private intervalId?: number;

  constructor(
    private onRun: (elapsedTicks: number) => void,
    private opts: RepeatingOptions,
    private onCancel?: () => void
  ) {
    super();
  }

  /**
   * タイマーを開始する
   */
  start() {
    this.intervalId = system.runInterval(() => {
      if (this.canceled) {
        this.clear();
        if (!this.forceCanceled) this.onCancel?.();
        return;
      }

      if (!this.stopped || this.opts.runWhileStopped === true) {
        if (!this.stopped) this.elapsedTicks += this.opts.period;
        this.onRun(this.elapsedTicks);
      }

      if (this.opts.max !== undefined && this.elapsedTicks >= this.opts.max) {
        this.clear();
        this.opts.onFinal?.();
      }
    }, this.opts.period);
  }

  /**
   * runIntervalを解除する
   */
  private clear() {
    if (this.intervalId !== undefined) {
      system.clearRun(this.intervalId);
      this.intervalId = undefined;
    }
  }
}

/**
 * RepeatingTimerを生成する
 * @param opts
 * @returns {RepeatingTimer}
 */
export function repeating(opts: {
  every?: number;
  run: (elapsedTicks: number) => void;
  max?: number;
  runWhileStopped?: boolean;
  cancel?: () => void;
  final?: () => void;
}): RepeatingTimer {
  const t = new RepeatingTimer(
    opts.run,
    { 
      period: opts.every ?? 1,
      max: opts.max,
      runWhileStopped: opts.runWhileStopped,
      onFinal:
      opts.final
    },
    opts.cancel
  );
  t.start();
  return t;
}

/**
 * 指定tick後に1回だけ処理を実行するタイマー
 */
export class DelayedTimer extends BaseTimer {
  /** runTimeoutの識別子 */
  private timeoutId?: number;

  constructor(
    private delay: number,
    private onRun: () => void,
    private onCancel?: () => void
  ) {
    super();
  }

  /**
   * タイマーを開始する
   */
  start() {
    this.timeoutId = system.runTimeout(() => {
      if (this.canceled) {
        this.onCancel?.();
        return;
      }
      this.onRun();
    }, this.delay);
  }

  /**
   * タイマーをキャンセルする
   */
  cancel() {
    super.cancel();
    if (this.timeoutId !== undefined) {
      system.clearRun(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}

/**
 * DelayedTimerを生成する
 * @param ticks
 * @param run
 * @param cancel
 * @returns {DelayedTimer}
 */
export function delayed(
  ticks: number,
  run: () => void,
  cancel?: () => void
): DelayedTimer {
  const t = new DelayedTimer(ticks, run, cancel);
  t.start();
  return t;
}

/**
 * 指定tick後にresolveされるPromiseを返す
 * @param ticks
 * @returns {Promise<void>}
 */
export function sleep(ticks: number): Promise<void> {
  return new Promise(resolve => {
    delayed(ticks, resolve);
  });
}

/**
 * UntilTimerのオプション
 */
export interface UntilOptions {
  /** 条件 */
  when: () => boolean;

  /** 条件成立時 */
  run: () => void;

  /** チェック周期 (tick) */
  every?: number;

  /** タイムアウト (tick) */
  timeout?: number;

  /** タイムアウト時 */
  onTimeout?: () => void;

  /** キャンセル時 */
  cancel?: () => void;
}

/**
 * 条件が true になるまで、またはタイムアウトまで監視するタイマー
 */
export class UntilTimer extends BaseTimer {
  private intervalId?: number;
  private elapsed = 0;

  constructor(
    private condition: () => boolean,
    private onRun: () => void,
    private period: number,
    private timeout?: number,
    private onTimeout?: () => void,
    private onCancel?: () => void
  ) {
    super();
  }

  start() {
    this.intervalId = system.runInterval(() => {
      if (this.canceled) {
        this.clear();
        this.onCancel?.();
        return;
      }

      if (this.stopped) return;

      this.elapsed += this.period;

      if (this.condition()) {
        this.clear();
        this.onRun();
        return;
      }

      if (this.timeout !== undefined && this.elapsed >= this.timeout) {
        this.clear();
        this.onTimeout?.();
      }
    }, this.period);
  }

  cancel() {
    super.cancel();
    this.clear();
  }

  private clear() {
    if (this.intervalId !== undefined) {
      system.clearRun(this.intervalId);
      this.intervalId = undefined;
    }
  }
}

/**
 * UntilTimerを生成する
 * @param opts
 * @returns {UntilTimer}
 */
export function until(opts: UntilOptions): UntilTimer {
  const t = new UntilTimer(
    opts.when,
    opts.run,
    opts.every ?? 1,
    opts.timeout,
    opts.onTimeout,
    opts.cancel
  );
  t.start();
  return t;
}

/**
 * 指定tick後にresolveされるPromiseを返す
 * @param condition
 * @param opts
 * @returns {Promise<boolean>}
 */
export function waitUntil(
  condition: () => boolean,
  opts?: { every?: number; timeout?: number }
): Promise<boolean> {
  return new Promise(resolve => {
    until({
      when: condition,
      every: opts?.every,
      timeout: opts?.timeout,
      run: () => resolve(true),
      onTimeout: () => resolve(false)
    });
  });
}
