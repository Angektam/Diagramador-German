import { Injectable, signal, computed } from '@angular/core';
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
        const user = JSON.parse(userData);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch {
        this.logout();
      }
    }
  }

  login(username: string, password: string): boolean {
    // Usuarios demo - en producción esto sería una llamada al backend
    const validUsers = [
      { id: '1', username: 'admin', password: 'admin123', email: 'admin@diagramador.com' },
      { id: '2', username: 'usuario', password: '123456', email: 'usuario@diagramador.com' },
      { id: '3', username: 'demo', password: 'demo', email: 'demo@diagramador.com' }
    ];

    const user = validUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      const userData: User = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      
      this.currentUser.set(userData);
      this.isAuthenticated.set(true);
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      
      return true;
    }
    
    return false;
  }

  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    
    this.router.navigate(['/login']);
  }

  register(username: string, email: string, password: string): boolean {
    // Simulación de registro - en producción sería una llamada al backend
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    if (existingUsers.find((u: any) => u.username === username)) {
      return false; // Usuario ya existe
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password
    };

    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    return true;
  }
}