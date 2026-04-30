import { Injectable, inject, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ThemeService } from './theme.service';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

/**
 * Servicio de atajos de teclado globales.
 * Registra combinaciones de teclas para navegación rápida y acciones comunes.
 */
@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService implements OnDestroy {
  private router = inject(Router);
  private auth = inject(AuthService);
  private themeService = inject(ThemeService);
  private zone = inject(NgZone);
  private handler: ((e: KeyboardEvent) => void) | null = null;

  private shortcuts: Shortcut[] = [
    {
      key: 'n',
      ctrl: true,
      shift: true,
      description: 'Nuevo prompt',
      action: () => this.navigateIfAuth('/generator')
    },
    {
      key: 'd',
      ctrl: true,
      shift: true,
      description: 'Ir al dashboard',
      action: () => this.navigateIfAuth('/dashboard')
    },
    {
      key: 't',
      ctrl: true,
      shift: true,
      description: 'Cambiar tema',
      action: () => this.themeService.toggle()
    },
    {
      key: '/',
      ctrl: true,
      description: 'Enfocar búsqueda',
      action: () => this.focusSearch()
    },
  ];

  init(): void {
    this.zone.runOutsideAngular(() => {
      this.handler = (e: KeyboardEvent) => this.handleKeydown(e);
      document.addEventListener('keydown', this.handler);
    });
  }

  getShortcuts(): Shortcut[] {
    return [...this.shortcuts];
  }

  ngOnDestroy(): void {
    if (this.handler) {
      document.removeEventListener('keydown', this.handler);
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    // No interceptar si el usuario está escribiendo en un input/textarea
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Solo permitir Escape en inputs
      if (e.key === 'Escape') {
        (target as HTMLInputElement).blur();
      }
      return;
    }

    for (const shortcut of this.shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;

      if (e.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        this.zone.run(() => shortcut.action());
        return;
      }
    }
  }

  private navigateIfAuth(path: string): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([path]);
    }
  }

  private focusSearch(): void {
    const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
}
