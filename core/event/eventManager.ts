import type { Listener } from './event';

class EventManager {
  static instance: EventManager;

  private listeners: Listener[] = [];

  register(listener: Listener) {
    this.listeners.push(listener);
  }
}

export const eventManager = new EventManager();