import { system } from "@minecraft/server";

/**
 * ============================================================
 * マスター Interval（負荷分散スケジューラ）
 * ============================================================
 */

export class TimerScheduler {
  private static tasks: Set<() => void> = new Set();
  private static tick = 0;
  private static started = false;

  /** スケジューラにタスクを登録 */
  static addTask(task: () => void) {
    this.tasks.add(task);
    this.ensureStarted();
  }

  /** タスクを削除 */
  static removeTask(task: () => void) {
    this.tasks.delete(task);
  }

  /** Interval を開始（1 本だけ） */
  private static ensureStarted() {
    if (this.started) return;
    this.started = true;

    system.runInterval(() => {
      this.tick++;

      for (const task of this.tasks) {
        try {
          task();
        } catch (e) {
          console.error("[TimerScheduler] Task error:", e);
        }
      }
    }, 1);
  }
}

/** 内部キャンセル結果 */
enum CancelResult {
  SUCCESS,
  FORCE,
  FAILURE,
}

/**
 * ============================================================
 * Base Timer
 * ============================================================
 * スケジューラに登録され、tick ごとに管理される抽象クラス
 */
abstract class Timer {
  protected currentTick = 0;
  protected onRun?: (currentTick: number) => void;
  protected onCancel?: () => void;
  protected stopped = false;
  protected canceled = false;
  protected forceCanceled = false;

  /** スケジューラに登録されたタスク */
  protected task?: () => void;

  constructor(onRun?: (currentTick: number) => void, onCancel?: () => void) {
    this.onRun = onRun;
    this.onCancel = onCancel;
  }

  /** 開始（各派生クラスで実装） */
  abstract start(): void;

  /** 一時停止 */
  stop() { this.stopped = true; }

  /** 再開 */
  resume() { this.stopped = false; }

  /** 停止しているか */
  isStopped(): boolean { return this.stopped }

  /** キャンセル要求 */
  cancel(force = false) {
    if (force) this.forceCanceled = true;
    this.canceled = true;
  }

  /** タイマー内部キャンセル */
  protected internalCancel(force = false): CancelResult {
    if (!this.task) return CancelResult.FAILURE;

    TimerScheduler.removeTask(this.task);
    this.onCancel?.();

    return force ? CancelResult.FORCE : CancelResult.SUCCESS;
  }
}

/* ============================================================
 * Repeating Timer
 * ============================================================ */

export interface RepeatingOptions {
  period?: number;
  endless?: boolean;
  silenceOnStop?: boolean;
  maxElapsedTicks?: number;
  onFinal?: () => void;
}

/**
 * 一定間隔で実行される繰り返しタイマー
 */
export class RepeatingTimer extends Timer {
  private period: number;
  private endless: boolean;
  private silenceOnStop: boolean;
  private maxElapsedTicks?: number;
  private onFinal?: () => void;

  constructor(
    onRun?: (currentTick: number) => void,
    opts: RepeatingOptions = {},
    onCancel?: () => void
  ) {
    super(onRun, onCancel);
    this.period = opts.period ?? 1;
    this.endless = opts.endless ?? true;
    this.silenceOnStop = opts.silenceOnStop ?? true;
    this.maxElapsedTicks = opts.maxElapsedTicks;
    this.onFinal = opts.onFinal;
  }

  /** タイマー開始 */
  start(): void {
    this.task = () => {
      // キャンセル処理
      if (this.forceCanceled) return this.internalCancel(true);
      if (this.canceled) return this.internalCancel();

      // 上限チェック
      if (!this.endless && this.maxElapsedTicks !== undefined &&
          this.currentTick >= this.maxElapsedTicks) {
        this.onFinal?.();
        return this.internalCancel();
      }

      // 実行タイミング
      if (this.currentTick % this.period === 0) {
        if (!this.stopped || (this.stopped && !this.silenceOnStop))
          this.onRun?.(this.currentTick);
      }

      if (!this.stopped) this.currentTick++;
    };

    TimerScheduler.addTask(this.task);
  }
}

/* ============================================================
 * Delayed Timer
 * ============================================================ */

export interface DelayedOptions {
  delay?: number;
}

/**
 * 指定 tick 後に一度だけ実行されるタイマー
 */
export class DelayedTimer extends Timer {
  private delay: number;

  constructor(
    onRun?: (currentTick: number) => void,
    opts: DelayedOptions = {},
    onCancel?: () => void
  ) {
    super(onRun, onCancel);
    this.delay = opts.delay ?? 1;
  }

  start(): void {
    this.task = () => {
      if (this.forceCanceled) return this.internalCancel(true);
      if (this.canceled) return this.internalCancel();

      if (this.currentTick >= this.delay) {
        this.onRun?.(this.currentTick);
        return this.internalCancel();
      }

      this.currentTick++;
    };

    TimerScheduler.addTask(this.task);
  }
}

/* =========================================================
 * シンプル API
 * ========================================================= */

export function repeating(opts: {
  every?: number;
  endless?: boolean;
  max?: number;
  silenceWhenStopped?: boolean;
  run?: (tick: number) => void;
  cancel?: () => void;
  final?: () => void;
  until?: Array<() => boolean>;
}): RepeatingTimer {
  const t = new RepeatingTimer(opts.run, opts, opts.cancel);
  t.start();
  return t;
}

export function delayed(
  ticks: number,
  run: () => void,
  cancel?: () => void
): DelayedTimer {
  const t = new DelayedTimer(() => run(), { delay: ticks }, cancel);
  t.start();
  return t;
}

/* ============================================================
 * sleep (Promise)
 * ============================================================ */

export function sleep(tick: number): Promise<void> {
  return new Promise((resolve) => {
    new DelayedTimer(() => resolve(), { delay: tick }).start();
  });
}
