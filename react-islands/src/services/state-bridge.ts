type StateListener<T> = (data: T) => void;

/**
 * A lightweight shared state bridge using BroadcastChannel.
 * Syncs multiple React Islands on a single JSP page or across iframes.
 */
export class StateBridge<T> {
  private channel: BroadcastChannel;
  private listeners: Set<StateListener<T>> = new Set();

  private lastState: T | null = null;

  constructor(channelName: string) {
    this.channel = new BroadcastChannel(channelName);
    this.channel.onmessage = (event: MessageEvent<T>) => {
      this.lastState = event.data;
      this.listeners.forEach((fn) => fn(event.data));
    };
  }

  /**
   * Get the last known state.
   */
  getLastState(): T | null {
    return this.lastState;
  }

  /**
   * Publish state to all other islands subscribed to this channel.
   */
  publish(data: T): void {
    this.lastState = data;
    this.channel.postMessage(data);
    this.listeners.forEach((fn) => fn(data));
  }

  /**
   * Subscribe to state updates. Returns an unsubscribe function.
   */
  subscribe(fn: StateListener<T>): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /**
   * Clean up the channel when no longer needed.
   */
  destroy(): void {
    this.channel.close();
    this.listeners.clear();
  }
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: number;
}

// Define the shape of our global UI state
export interface GlobalUIState {
  theme: "light" | "dark" | "enterprise";
  lastUpdate: number;
  notifications: Notification[];
  userContext?: {
    id: string;
    roles: string[];
  };
}

// Global UI sync instance with a concrete type instead of any
export const uiSyncBridge = new StateBridge<GlobalUIState>("ui-sync");

export const notificationBridge = {
  send: (type: Notification["type"], message: string) => {
    const currentState = uiSyncBridge.getLastState?.() || {
      theme: "light",
      lastUpdate: Date.now(),
      notifications: [],
    };
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(7),
      type,
      message,
      timestamp: Date.now(),
    };
    uiSyncBridge.publish({
      ...currentState,
      notifications: [...currentState.notifications, newNotification],
      lastUpdate: Date.now(),
    });
  },
};
