import { Priority } from "./priority";

/** リスナー型 */
export interface Listener<T> {
  handler(event: T): void;
  priority?: Priority;
}
