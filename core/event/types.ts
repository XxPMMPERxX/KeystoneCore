/** リスナー型 */
export interface Listener<T> {
  handler(event: T): void;
  priority?: Priority;
}

/** 優先度 */
export enum Priority {
  LOWEST = 5,
  LOW = 4,
  NORMAL = 3,
  HIGH = 2,
  HIGHEST = 1,
  MONITOR = 0
}
