import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'pg_theme';
  theme = signal<Theme>((localStorage.getItem(this.KEY) as Theme) ?? 'light');

  toggle() { this.set(this.theme() === 'light' ? 'dark' : 'light'); }

  set(t: Theme) {
    this.theme.set(t);
    localStorage.setItem(this.KEY, t);
    document.documentElement.setAttribute('data-theme', t);
  }

  init() { document.documentElement.setAttribute('data-theme', this.theme()); }
}
