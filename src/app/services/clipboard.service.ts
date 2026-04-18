import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  constructor(private notifications: NotificationService) {}

  async copyText(text: string, successMessage = 'Copiado al portapapeles'): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      if (successMessage) {
        this.notifications.success(successMessage);
      }
      return true;
    } catch {
      this.notifications.error('No se pudo copiar al portapapeles');
      return false;
    }
  }
}
