import { Injectable, signal, OnDestroy } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private readonly KEY = 'pg_theme';
  private mediaQuery: MediaQueryList | null = null;
  private mediaListener: ((e: MediaQueryListEvent) => void) | null = null;

  /** Preferencia guardada (puede ser 'system') */
  preference = signal<Theme>((localStorage.getItem(this.KEY) as Theme) ?? 'system');
  /** Tema efectivo aplicado (solo 'light' o 'dark') */
  theme = signal<'light' | 'dark'>(this.resolveTheme());

  toggle(): void {
    const current = this.preference();
    if (current === 'light') this.set('dark');
    else if (current === 'dark') this.set('system');
    else this.set('light');
  }

  set(t: Theme): void {
    this.preference.set(t);
    localStorage.setItem(this.KEY, t);
    this.applyTheme();
  }

  init(): void {
    // Escuchar cambios en preferencia del sistema
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaListener = () => {
        if (this.preference() === 'system') {
          this.applyTheme();
        }
      };
      this.mediaQuery.addEventListener('change', this.mediaListener);
    }
    this.applyTheme();
  }

  ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaListener) {
      this.mediaQuery.removeEventListener('change', this.mediaListener);
    }
  }

  private applyTheme(): void {
    const resolved = this.resolveTheme();
    this.theme.set(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }

  private resolveTheme(): 'light' | 'dark' {
    const pref = (localStorage.getItem(this.KEY) as Theme) ?? 'system';
    if (pref === 'light' || pref === 'dark') return pref;
    // System preference
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
}
