type TriggerCallback<T = any> = (payload: T) => void;

export class Trigger<T = any> {
  private listeners = new Set<TriggerCallback<T>>();

  subscribe(callback: TriggerCallback<T>) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  emit(payload: T) {
    this.listeners.forEach((listener) => listener(payload));
  }
}

export const reservationCancelledTrigger = new Trigger<string>();
export const bookingConfirmedTrigger = new Trigger<{ id: string; total: number; vehicle: string }>();
