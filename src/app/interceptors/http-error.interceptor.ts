import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional para manejo centralizado de errores HTTP.
 * - 401: Redirige a login (sesión expirada)
 * - 403: Notifica acceso denegado
 * - 429: Notifica rate limiting
 * - 500+: Notifica error del servidor
 * - 0: Error de red / CORS
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 0:
          notifications.error('No se pudo conectar al servidor');
          break;
        case 401:
          notifications.warning('Sesión expirada. Inicia sesión nuevamente.');
          auth.logout();
          break;
        case 403:
          notifications.error('No tienes permisos para esta acción');
          break;
        case 404:
          // No notificar 404 — puede ser intencional
          break;
        case 429:
          notifications.warning('Demasiadas solicitudes. Espera un momento.');
          break;
        default:
          if (error.status >= 500) {
            notifications.error('Error del servidor. Intenta más tarde.');
          }
      }

      return throwError(() => error);
    })
  );
};
