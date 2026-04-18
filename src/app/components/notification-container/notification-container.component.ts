import { Component, inject, signal } from '@angular/core';
import { NotificationService, Notification, NotificationType } from '../../services/notification.service';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  template: `
    <div class="notification-container" aria-live="polite">
      @for (n of notifications(); track n.id) {
        <div
          class="notification toast notification-{{ n.type }}"
          [class.dismissing]="dismissing().has(n.id)"
          role="alert"
          (click)="dismiss(n.id)"
        >
          <span class="notification-icon">{{ icon(n.type) }}</span>
          <span class="notification-message">{{ n.message }}</span>
          <button
            type="button"
            class="notification-close"
            aria-label="Cerrar"
            (click)="dismiss(n.id); $event.stopPropagation()"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
      pointer-events: none;
    }
    .notification-container .toast {
      pointer-events: auto;
    }
    .notification {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,.25);
      border: 1px solid transparent;
      cursor: pointer;
      animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      font-size: 14px;
      line-height: 1.4;
    }
    .notification.dismissing {
      animation: toastOut 0.25s ease-in forwards;
    }
    .notification-icon {
      font-size: 18px;
      flex-shrink: 0;
    }
    .notification-message {
      flex: 1;
      min-width: 0;
    }
    .notification-close {
      background: none;
      border: none;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      opacity: 0.7;
      padding: 0 4px;
      color: inherit;
    }
    .notification-close:hover {
      opacity: 1;
    }
    .notification-success {
      background: #0f172a;
      border-color: #22c55e;
      color: #f1f5f9;
    }
    .notification-success .notification-icon { color: #22c55e; }
    .notification-error {
      background: #1c1917;
      border-color: #ef4444;
      color: #f1f5f9;
    }
    .notification-error .notification-icon { color: #ef4444; }
    .notification-warning {
      background: #1c1917;
      border-color: #f59e0b;
      color: #f1f5f9;
    }
    .notification-warning .notification-icon { color: #f59e0b; }
    .notification-info {
      background: #0f172a;
      border-color: #6d28d9;
      color: #f1f5f9;
    }
    .notification-info .notification-icon { color: #8b5cf6; }
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(110%); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes toastOut {
      from { opacity: 1; transform: translateX(0); max-height: 80px; margin-bottom: 0; }
      to   { opacity: 0; transform: translateX(110%); max-height: 0; margin-bottom: -10px; }
    }
  `]
})
export class NotificationContainerComponent {
  private notif = inject(NotificationService);
  notifications = this.notif.notificationsList;
  dismissing = signal<Set<string>>(new Set());

  icon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] ?? '•';
  }

  dismiss(id: string): void {
    // Trigger exit animation, then actually remove
    this.dismissing.update(s => new Set([...s, id]));
    setTimeout(() => {
      this.notif.dismiss(id);
      this.dismissing.update(s => { const n = new Set(s); n.delete(id); return n; });
    }, 240);
  }
}
