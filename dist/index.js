import { system as s } from "@minecraft/server";
class e {
  constructor() {
    if (e.instance)
      return e.instance;
    e.instance = this;
  }
  /**
   * リピート処理
   * @param callback
   * @param period 
   * @param delay
   * @returns {number}
   */
  scheduleRepeatingTask(t, n, r = 0) {
    let o = -1;
    return s.runTimeout(() => {
      o = s.runInterval(() => t, n);
    }, r), o;
  }
  /**
   * 遅延処理
   * @param callback
   * @param delay
   * @returns {number}
   */
  scheduleDelayedTask(t, n) {
    return s.runTimeout(() => t, n);
  }
}
class c {
  constructor() {
    this.scheduler = new e(), console.log("hello");
  }
}
const a = new c();
export {
  a as keystone
};
