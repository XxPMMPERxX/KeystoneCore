import { Listener } from "./event";

export class EventManager {
  static instance: EventManager;

  private listeners: Listener[];

  constructor () {
    if (EventManager.instance) {
      return EventManager.instance;
    }
    EventManager.instance = this;
  }

  register(listener: Listener) {
    this.listeners.push(listener);
  }
}
