import { Injectable, signal } from '@angular/core';

export type NotificationType = 'error' | 'success' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<Notification[]>([]);

  private autoRemoveTimeout = 5000;
  private readonly timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  show(message: string, type: NotificationType = 'error'): void {
    const id = crypto.randomUUID();
    this.notifications.update(n => [...n, { id, message, type }]);

    this.timeouts.set(id, setTimeout(() => {
      this.remove(id);
    }, this.autoRemoveTimeout));
  }

  remove(id: string): void {
    const timeout = this.timeouts.get(id);
    if (timeout !== undefined) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
    this.notifications.update(n => n.filter(x => x.id !== id));
  }
}
