import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  lastLogin?: string;
}

export interface AuthSession {
  user: User;
  expiresAt: number;
}

/** Máximo de intentos de login antes de bloqueo temporal */
const MAX_LOGIN_ATTEMPTS = 5;
/** Duración del bloqueo en ms (2 minutos) */
const LOCKOUT_DURATION = 2 * 60 * 1000;
/** Duración de la sesión en ms (8 horas) */
const SESSION_DURATION = 8 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);
  private loginAttempts = signal<number>(0);
  private lockedUntil = signal<number>(0);

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = this.isAuthenticated.asReadonly();
  readonly attempts = this.loginAttempts.asReadonly();
  readonly isLocked = () => Date.now() < this.lockedUntil();

  constructor(private router: Router) {
    this.checkAuthStatus();
    this.loadLockoutState();
  }

  private checkAuthStatus(): void {
    try {
      const sessionRaw = localStorage.getItem('pg_session');
      if (!sessionRaw) return;

      const session: AuthSession = JSON.parse(sessionRaw);
      if (!session.user || !session.expiresAt) {
        this.clearSession();
        return;
      }

      // Verificar expiración de sesión
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return;
      }

      this.currentUser.set(session.user);
      this.isAuthenticated.set(true);
    } catch {
      this.clearSession();
    }
  }

  private loadLockoutState(): void {
    try {
      const lockData = localStorage.getItem('pg_lockout');
      if (lockData) {
        const { attempts, lockedUntil } = JSON.parse(lockData);
        if (Date.now() < lockedUntil) {
          this.loginAttempts.set(attempts);
          this.lockedUntil.set(lockedUntil);
        } else {
          localStorage.removeItem('pg_lockout');
        }
      }
    } catch {
      localStorage.removeItem('pg_lockout');
    }
  }

  login(username: string, password: string): { success: boolean; error?: string } {
    // Verificar bloqueo
    if (this.isLocked()) {
      const remaining = Math.ceil((this.lockedUntil() - Date.now()) / 1000);
      return { success: false, error: `Cuenta bloqueada. Intenta en ${remaining}s` };
    }

    // Sanitizar inputs
    const sanitizedUser = this.sanitizeInput(username);
    const sanitizedPass = password; // No sanitizar password (puede tener caracteres especiales)

    if (!sanitizedUser || !sanitizedPass) {
      return { success: false, error: 'Credenciales inválidas' };
    }

    // Usuarios demo con hash simulado
    const demoUsers = [
      { id: '1', username: 'admin',   hash: this.hashPassword('admin123'), email: 'admin@promptgen.com', role: 'admin' as const },
      { id: '2', username: 'usuario', hash: this.hashPassword('123456'),   email: 'usuario@promptgen.com', role: 'user' as const },
      { id: '3', username: 'demo',    hash: this.hashPassword('demo'),     email: 'demo@promptgen.com', role: 'user' as const },
    ];

    const registered: Array<{ id: string; username: string; email: string; hash: string; role: 'user' }> =
      this.loadRegisteredUsers();

    const allUsers = [...demoUsers, ...registered];
    const found = allUsers.find(
      u => u.username.toLowerCase() === sanitizedUser.toLowerCase() && u.hash === this.hashPassword(sanitizedPass)
    );

    if (!found) {
      this.recordFailedAttempt();
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }

    // Login exitoso — resetear intentos
    this.loginAttempts.set(0);
    this.lockedUntil.set(0);
    localStorage.removeItem('pg_lockout');

    const userData: User = {
      id: found.id,
      username: found.username,
      email: found.email,
      role: found.role,
      lastLogin: new Date().toISOString()
    };

    const session: AuthSession = {
      user: userData,
      expiresAt: Date.now() + SESSION_DURATION
    };

    this.currentUser.set(userData);
    this.isAuthenticated.set(true);
    localStorage.setItem('pg_session', JSON.stringify(session));

    return { success: true };
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.clearSession();
    this.router.navigate(['/login']);
  }

  register(username: string, email: string, password: string): { success: boolean; error?: string } {
    const sanitizedUser = this.sanitizeInput(username);
    const sanitizedEmail = this.sanitizeInput(email).toLowerCase();

    if (!sanitizedUser || sanitizedUser.length < 3 || sanitizedUser.length > 50) {
      return { success: false, error: 'Usuario debe tener entre 3 y 50 caracteres' };
    }

    if (!this.isValidEmail(sanitizedEmail)) {
      return { success: false, error: 'Email inválido' };
    }

    if (password.length < 6 || password.length > 100) {
      return { success: false, error: 'Contraseña debe tener entre 6 y 100 caracteres' };
    }

    const existing = this.loadRegisteredUsers();
    if (existing.find(u => u.username.toLowerCase() === sanitizedUser.toLowerCase())) {
      return { success: false, error: 'El usuario ya existe' };
    }
    if (existing.find(u => u.email.toLowerCase() === sanitizedEmail)) {
      return { success: false, error: 'El email ya está registrado' };
    }

    existing.push({
      id: Date.now().toString(),
      username: sanitizedUser,
      email: sanitizedEmail,
      hash: this.hashPassword(password),
      role: 'user'
    });
    localStorage.setItem('pg_registeredUsers', JSON.stringify(existing));
    return { success: true };
  }

  /** Verificar si la sesión sigue activa (para guards) */
  isSessionValid(): boolean {
    try {
      const sessionRaw = localStorage.getItem('pg_session');
      if (!sessionRaw) return false;
      const session: AuthSession = JSON.parse(sessionRaw);
      return Date.now() < session.expiresAt;
    } catch {
      return false;
    }
  }

  /** Extender sesión (llamar en actividad del usuario) */
  extendSession(): void {
    if (!this.isAuthenticated()) return;
    try {
      const sessionRaw = localStorage.getItem('pg_session');
      if (!sessionRaw) return;
      const session: AuthSession = JSON.parse(sessionRaw);
      session.expiresAt = Date.now() + SESSION_DURATION;
      localStorage.setItem('pg_session', JSON.stringify(session));
    } catch { /* no-op */ }
  }

  getRemainingLockTime(): number {
    return Math.max(0, Math.ceil((this.lockedUntil() - Date.now()) / 1000));
  }

  private recordFailedAttempt(): void {
    const attempts = this.loginAttempts() + 1;
    this.loginAttempts.set(attempts);

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_DURATION;
      this.lockedUntil.set(lockUntil);
      localStorage.setItem('pg_lockout', JSON.stringify({ attempts, lockedUntil: lockUntil }));
    }
  }

  /**
   * Hash simple para demo (SHA-256 simulado con Web Crypto no es síncrono,
   * así que usamos un hash determinista básico). En producción usar bcrypt en backend.
   */
  private hashPassword(password: string): string {
    let hash = 0;
    const salt = 'pg_salt_2026';
    const salted = salt + password + salt;
    for (let i = 0; i < salted.length; i++) {
      const char = salted.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Doble iteración para mayor dispersión
    for (let i = 0; i < salted.length; i++) {
      const char = salted.charCodeAt(i);
      hash = ((hash << 7) - hash) + char + i;
      hash = hash & hash;
    }
    return 'h$' + Math.abs(hash).toString(36);
  }

  private sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>"'&]/g, '') // Eliminar caracteres peligrosos
      .slice(0, 200); // Limitar longitud
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  private loadRegisteredUsers(): Array<{ id: string; username: string; email: string; hash: string; role: 'user' }> {
    try {
      // Migrar datos antiguos si existen
      const oldData = localStorage.getItem('registeredUsers');
      if (oldData) {
        const oldUsers = JSON.parse(oldData);
        const migrated = oldUsers.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          hash: u.hash || this.hashPassword(atob(u.password || '')),
          role: 'user' as const
        }));
        localStorage.setItem('pg_registeredUsers', JSON.stringify(migrated));
        localStorage.removeItem('registeredUsers');
        return migrated;
      }
      const raw = localStorage.getItem('pg_registeredUsers');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private clearSession(): void {
    localStorage.removeItem('pg_session');
    // Limpiar datos legacy
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
  }
}
