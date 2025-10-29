export declare class Scheduler {
    static instance: Scheduler;
    constructor();
    /**
     * リピート処理
     * @param callback
     * @param period
     * @param delay
     * @returns {number}
     */
    scheduleRepeatingTask(callback: () => undefined, period: number, delay?: number): number;
    /**
     * 遅延処理
     * @param callback
     * @param delay
     * @returns {number}
     */
    scheduleDelayedTask(callback: () => undefined, delay: number): number;
}
