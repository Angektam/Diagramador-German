import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);
  private readonly tokenKey = 'authToken';

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = this.isAuthenticated.asReadonly();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    const userData = localStorage.getItem('currentUser');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (userData && isLoggedIn) {
      try {
        const user = JSON.parse(userData);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch {
        this.logout();
      }
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ token: string; user: User }>('/api/auth/login', { username, password })
      );

      this.currentUser.set(response.user);
      this.isAuthenticated.set(true);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem(this.tokenKey, response.token);
      return true;
    } catch {
      return false;
    }
  }

  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem(this.tokenKey);
    
    this.router.navigate(['/login']);
  }

  async register(username: string, email: string, password: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post('/api/auth/register', { username, email, password })
      );
      return true;
    } catch {
      return false;
    }
  }
}