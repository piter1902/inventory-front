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

  show(message: string, type: NotificationType = 'error'): void {
    const id = crypto.randomUUID();
    this.notifications.update(n => [...n, { id, message, type }]);

    setTimeout(() => {
      this.remove(id);
    }, this.autoRemoveTimeout);
  }

  remove(id: string): void {
    this.notifications.update(n => n.filter(x => x.id !== id));
  }
}
