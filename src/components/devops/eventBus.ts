type DevOpsEvent = {
  type: 'auth' | 'error' | 'action' | 'system' | 'api' | 'ui';
  name: string;
  payload?: any;
  timestamp: number;
};

type Listener = (event: DevOpsEvent) => void;

class DevOpsEventBus {
  private listeners: Listener[] = [];

  emit(type: DevOpsEvent['type'], name: string, payload?: any) {
    const event: DevOpsEvent = {
      type,
      name,
      payload,
      timestamp: Date.now()
    };

    // console log (dev mode)
    console.log('[DEVOPS EVENT]', event);

    this.listeners.forEach((l) => l(event));
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const devopsBus = new DevOpsEventBus();
