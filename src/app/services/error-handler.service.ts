import { Injectable, ErrorHandler, inject, NgZone } from '@angular/core';
import { NotificationService } from './notification.service';

/**
 * Manejador global de errores no capturados.
 * Captura errores de componentes, servicios y promesas rechazadas.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private notifications = inject(NotificationService);
  private zone = inject(NgZone);

  handleError(error: unknown): void {
    // Ejecutar dentro de la zona de Angular para que las notificaciones se rendericen
    this.zone.run(() => {
      const message = this.extractMessage(error);

      // No mostrar errores de navegación cancelada (son normales)
      if (message.includes('Navigation') || message.includes('NG04002')) {
        console.debug('[ErrorHandler] Navigation error (ignored):', message);
        return;
      }

      // No mostrar errores de chunk loading (lazy load fallido)
      if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
        this.notifications.warning('Error de conexión. Recarga la página.');
        console.error('[ErrorHandler] Chunk load error:', message);
        return;
      }

      // Errores de red
      if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
        this.notifications.error('Error de red. Verifica tu conexión.');
        console.error('[ErrorHandler] Network error:', message);
        return;
      }

      // Error genérico
      this.notifications.error('Ocurrió un error inesperado');
      console.error('[ErrorHandler] Unhandled error:', error);
    });
  }

  private extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
    return 'Error desconocido';
  }
}
