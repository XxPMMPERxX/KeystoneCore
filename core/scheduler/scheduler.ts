import { system } from '@minecraft/server';

export class Scheduler {
  static instance: Scheduler;

  constructor () {
    if (Scheduler.instance) {
      return Scheduler.instance;
    }
    Scheduler.instance = this;
  }

  /**
   * リピート処理
   * @param {()=>void} callback
   * @param {number} period 
   * @param {number} firstDelay
   * @returns {number}
   */
  scheduleRepeatingTask(callback: ()=>void, period: number, firstDelay: number = 0): number {
    let id: number = -1;

    system.runTimeout(() => {
      id = system.runInterval(() => callback, period);
    }, firstDelay);

    return id;
  }

  /**
   * 同期的状況待ち処理
   * @param {()=>void} callback
   * @param {()=>boolean} until
   * @param {number} period
   * @param {number} firstDelay
   * @returns {number}
   */
  scheduleUntilCompleteTask(callback: ()=>void, until: ()=>boolean, period: number = 1, firstDelay: number = 0): number {
    let id: number = -1;

    system.runTimeout(() => {
      id = system.runInterval(() => {
        if (until()) {
          system.clearRun(id);
        } else {
          callback();
        }
      }, period);
    }, firstDelay);

    return id;
  }

  /**
   * 遅延処理
   * @param {()=>void} callback
   * @param {number} delay
   * @returns {number}
   */
  scheduleDelayedTask(callback: ()=>void, delay: number): number {
    return system.runTimeout(() => callback, delay);
  }
}
