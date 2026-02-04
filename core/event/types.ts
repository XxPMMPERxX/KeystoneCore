/** リスナー型 */
export interface Listener<T> {
  handler(event: T): void;
  priority?: Priority;
}

/** 優先度 */
export enum Priority {
  HIGHEST = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
  LOWEST = 5,
  /** 監視用（最後に実行される） */
  MONITOR = 6
}
