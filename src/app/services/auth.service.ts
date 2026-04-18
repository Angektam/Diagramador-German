import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  username: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = this.isAuthenticated.asReadonly();

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    const userData = localStorage.getItem('currentUser');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (userData && isLoggedIn) {
      try {
        this.currentUser.set(JSON.parse(userData));
        this.isAuthenticated.set(true);
      } catch { this.logout(); }
    }
  }

  login(username: string, password: string): boolean {
    const demoUsers = [
      { id: '1', username: 'admin',   password: 'admin123', email: 'admin@promptgen.com' },
      { id: '2', username: 'usuario', password: '123456',   email: 'usuario@promptgen.com' },
      { id: '3', username: 'demo',    password: 'demo',     email: 'demo@promptgen.com' },
    ];
    const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const found = [...demoUsers, ...registered].find(
      (u: any) => u.username === username && (u.password === password || u.password === btoa(password))
    );
    if (!found) return false;
    const userData: User = { id: found.id, username: found.username, email: found.email };
    this.currentUser.set(userData);
    this.isAuthenticated.set(true);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    return true;
  }

  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }

  register(username: string, email: string, password: string): boolean {
    const existing = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (existing.find((u: any) => u.username === username)) return false;
    existing.push({ id: Date.now().toString(), username, email, password: btoa(password) });
    localStorage.setItem('registeredUsers', JSON.stringify(existing));
    return true;
  }
}
