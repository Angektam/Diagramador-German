import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
  timestamp: number;
}

/** Máximo de notificaciones visibles simultáneamente */
const MAX_VISIBLE = 5;
/** Tiempo mínimo entre notificaciones duplicadas (ms) */
const DEDUP_WINDOW = 2000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  readonly notificationsList = this.notifications.asReadonly();

  show(
    message: string,
    type: NotificationType = 'info',
    duration: number = 4000
  ): void {
    // Prevenir notificaciones duplicadas en ventana corta
    const current = this.notifications();
    const isDuplicate = current.some(
      n => n.message === message && n.type === type && (Date.now() - n.timestamp) < DEDUP_WINDOW
    );
    if (isDuplicate) return;

    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const notification: Notification = { id, message, type, duration, timestamp: Date.now() };

    // Limitar notificaciones visibles
    const updated = [...current, notification];
    if (updated.length > MAX_VISIBLE) {
      const removed = updated.shift();
      if (removed) this.clearTimer(removed.id);
    }

    this.notifications.set(updated);

    const timer = setTimeout(() => {
      this.dismiss(id);
    }, duration);
    this.timers.set(id, timer);
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
    this.clearTimer(id);
    this.notifications.update(list => list.filter(n => n.id !== id));
  }

  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.notifications.set([]);
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
