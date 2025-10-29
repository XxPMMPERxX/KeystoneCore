import { Listener } from './event';
export declare class EventManager {
    static instance: EventManager;
    private listeners;
    constructor();
    register(listener: Listener): void;
}
