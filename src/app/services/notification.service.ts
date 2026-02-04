import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  readonly notificationsList = this.notifications.asReadonly();

  show(
    message: string,
    type: NotificationType = 'info',
    duration: number = 4000
  ): void {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, message, type, duration };

    this.notifications.update(list => [...list, notification]);

    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration ?? 5000);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  dismiss(id: string): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }

  clear(): void {
    this.notifications.set([]);
  }
}
