import { system } from "@minecraft/server";

enum CancelResult {
  SUCCESS, FORCE, FAILURE
}

abstract class Timer {
  public uniqueId: string;
  public label: string;
  protected runnerId?: number;
  protected currentTick: number = 0;
  protected onRun?: (currentTick: number)=>void;
  protected onCancel?: ()=>void;
  protected flagForStop: boolean = false;
  protected flagForCancel: boolean = false;
  protected flagForForceCancel: boolean = false;
  
  constructor(
    label?: string,
    onRun?: (currentTick: number)=>void,
    onCancel?: ()=>void
  ) {
    this.uniqueId = `#${Math.floor(Math.random() * 10000)}`;
    this.label = (label) ? label : this.uniqueId.toString();
    this.onRun = onRun;
    this.onCancel = onCancel;
  }

  /**
   * メイン処理
   * @param onRun 
   * @returns {Timer}
   */
  setRunHandler(onRun: (currentTick: number)=>void): Timer {
    this.onRun = onRun;
    return this;
  }

    /**
   * 中断時のハンドラの設定
   * @param onCancel 
   * @returns {Timer}
   */
  setCancelHandler(onCancel: ()=>void): Timer {
    this.onCancel = onCancel;
    return this;
  }

  /**
   * タイマースタート
   */
  abstract start(): void;

  /**
   * タイマーキャンセル
   * @param force
   */
  cancel(force: boolean = false): void {
    if (force) this.flagForForceCancel = true;
    this.flagForCancel = true;
  }

  /**
   * タイマーキャンセル
   * @param force 
   * @returns {CancelResult}
   */
  protected internalCancel(force: boolean = false): CancelResult {
    if (!this.runnerId) {
      console.warn(`[Keystone][Timer] タイマーが動いていないか既に削除されています！ (${this.uniqueId.toString()})`);
      return CancelResult.FAILURE;
    }
    system.clearRun(this.runnerId);

    if (force) {
      this.onCancel?.();
      return CancelResult.FORCE;
    }
    return CancelResult.SUCCESS;
  }

  /**
   * タイマー停止
   */
  stop(): void {
    this.flagForStop = true;
  }

  /**
   * タイマー再開
   */
  resume(): void {
    this.flagForStop = false;
  }
}

type RepeatingOptions = {
  period?: number;
  isEndless?: boolean;
  isSilenceOnStop?: boolean;
  maxElapsedTicks?: number;
  onFinal?: ()=>void;
}

export class RepeatingTimer extends Timer {
  protected options: RepeatingOptions = {}
  private period?: number;
  private isEndless?: boolean;
  private isSilenceOnStop?: boolean;
  private maxElapsedTicks?: number;
  private onFinal?: ()=>void;

  constructor(
    label?: string,
    onRun?: (currentTick: number)=>void,
    onCancel?: ()=>void,
    options: RepeatingOptions = {
      period: 1,
      isEndless: true,
      isSilenceOnStop: true,
      maxElapsedTicks: 5*60*20,
      onFinal: ()=>{}
    }
  ) {
    super(label, onRun, onCancel);

    this.period = options.period;
    this.isEndless = options.isEndless;
    this.isSilenceOnStop = options.isSilenceOnStop;
    this.maxElapsedTicks = options.maxElapsedTicks;
    this.onFinal = options.onFinal;
  }

  /**
   * 処理の間隔のティック
   * @param period
   * @returns {RepeatingTimer}
   */
  setPeriod(period: number): RepeatingTimer {
    this.period = period;
    return this;
  }

  /**
   * 永久に動かすかどうか
   * @param value 
   * @returns {RepeatingTimer}
   */
  setEndless(value: boolean): RepeatingTimer {
    this.isEndless = value;
    return this;
  }

  /**
   * ストップしているときにRunハンドラを動かすかどうか
   * @param value
   * @returns {RepeatingTimer}
   */
  setSilenceOnStop(value: boolean): RepeatingTimer {
    this.isSilenceOnStop = value;
    return this;
  }

  /**
   * 天井あり処理の終了時のハンドラ
   * @param onFinal 
   * @returns {RepeatingTimer}
   */
  setFinalHandler(onFinal: ()=>void): RepeatingTimer {
    this.onFinal = onFinal;
    return this;
  }

  start(): void {
    this.runnerId = system.runInterval(() => {
      if (this.flagForForceCancel) this.internalCancel(true);
      if (this.flagForCancel) this.internalCancel();
      if (this.currentTick % (this.period ?? 1) == 0) {
        if (!this.isEndless && this.maxElapsedTicks && this.maxElapsedTicks <= this.currentTick) {
          this.onFinal?.();
          this.internalCancel();
        }
        if (!this.flagForStop || (this.flagForStop && !this.isSilenceOnStop)) {
          this.onRun?.(this.currentTick);
        }
      }
      if (!this.flagForStop) this.currentTick++;
    }, 1);
  }
}
