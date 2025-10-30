import { system } from '@minecraft/server';

class Scheduler {
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
      id = system.runInterval(() => callback(), period);
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
   * @param {number} delay tick
   * @returns {number}
   */
  scheduleDelayedTask(callback: () => void, delay: number): number {
    return system.runTimeout(() => callback(), delay);
  }
}

export const scheduler = new Scheduler();
