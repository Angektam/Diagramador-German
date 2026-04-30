import { Injectable, inject, OnDestroy, NgZone } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Servicio que detecta actividad del usuario y extiende la sesión automáticamente.
 * Previene que la sesión expire mientras el usuario está activo.
 */
@Injectable({ providedIn: 'root' })
export class SessionActivityService implements OnDestroy {
  private auth = inject(AuthService);
  private zone = inject(NgZone);
  private lastActivity = Date.now();
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: (() => void)[] = [];

  /** Intervalo de verificación: cada 5 minutos */
  private readonly CHECK_INTERVAL = 5 * 60 * 1000;
  /** Umbral de inactividad para NO extender sesión: 30 minutos */
  private readonly INACTIVITY_THRESHOLD = 30 * 60 * 1000;

  init(): void {
    // Ejecutar fuera de la zona de Angular para no disparar change detection
    this.zone.runOutsideAngular(() => {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      const handler = () => { this.lastActivity = Date.now(); };

      events.forEach(event => {
        document.addEventListener(event, handler, { passive: true });
        this.listeners.push(() => document.removeEventListener(event, handler));
      });

      this.checkInterval = setInterval(() => this.checkSession(), this.CHECK_INTERVAL);
    });
  }

  private checkSession(): void {
    if (!this.auth.isLoggedIn()) return;

    const inactive = Date.now() - this.lastActivity;
    if (inactive < this.INACTIVITY_THRESHOLD) {
      // Usuario activo — extender sesión
      this.auth.extendSession();
    } else if (!this.auth.isSessionValid()) {
      // Sesión expirada y usuario inactivo — cerrar sesión
      this.zone.run(() => this.auth.logout());
    }
  }

  ngOnDestroy(): void {
    this.listeners.forEach(fn => fn());
    if (this.checkInterval) clearInterval(this.checkInterval);
  }
}
