import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        
        <!-- Tabs -->
        <div class="login-tabs">
          <button 
            (click)="isLoginMode.set(true)" 
            [class.active]="isLoginMode()"
            class="tab-button">
            Iniciar Sesión
          </button>
          <button 
            (click)="isLoginMode.set(false)" 
            [class.active]="!isLoginMode()"
            class="tab-button">
            Registrarse
          </button>
        </div>

        <!-- Login Form -->
        @if (isLoginMode()) {
          <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="login-form">
            <div class="login-header">
              <h1>🗂️ Diagramador SQL</h1>
              <p>Crea y gestiona tus diagramas de base de datos</p>
            </div>
            
            <div class="form-group">
              <label>Usuario</label>
              <input 
                type="text" 
                [(ngModel)]="loginData.username" 
                name="username" 
                placeholder="Ingresa tu usuario" 
                required 
                class="form-input">
            </div>
            
            <div class="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                [(ngModel)]="loginData.password" 
                name="password" 
                placeholder="Ingresa tu contraseña" 
                required 
                class="form-input">
            </div>
            
            <button 
              type="submit" 
              [disabled]="!loginForm.valid || isLoading()"
              class="btn-primary login-btn">
              {{ isLoading() ? 'Entrando...' : 'Iniciar Sesión' }}
            </button>

            <!-- Demo credentials -->
            <div class="demo-credentials">
              <strong>Usuarios de prueba:</strong><br>
              • admin / admin123<br>
              • usuario / 123456<br>
              • demo / demo
            </div>
          </form>
        }

        <!-- Register Form -->
        @if (!isLoginMode()) {
          <form (ngSubmit)="onRegister()" #registerForm="ngForm" class="login-form">
            <div class="login-header">
              <h1>Crear Cuenta</h1>
              <p>Únete y comienza a crear diagramas</p>
            </div>
            
            <div class="form-group">
              <label>Usuario</label>
              <input 
                type="text" 
                [(ngModel)]="registerData.username" 
                name="regUsername" 
                placeholder="Elige un nombre de usuario" 
                required 
                minlength="3"
                class="form-input">
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                [(ngModel)]="registerData.email" 
                name="email" 
                placeholder="tu@email.com" 
                required 
                class="form-input">
            </div>
            
            <div class="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                [(ngModel)]="registerData.password" 
                name="regPassword" 
                placeholder="Mínimo 6 caracteres" 
                required 
                minlength="6"
                class="form-input">
            </div>
            
            <button 
              type="submit" 
              [disabled]="!registerForm.valid || isLoading()"
              class="btn-primary login-btn register-btn">
              {{ isLoading() ? 'Creando cuenta...' : 'Crear Cuenta' }}
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: var(--bg-main);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background-image: 
        radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99, 102, 241, 0.08) 0%, transparent 55%),
        linear-gradient(180deg, rgba(42, 42, 42, 0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(42, 42, 42, 0.3) 1px, transparent 1px);
      background-size: 100% 100%, 40px 40px, 40px 40px;
    }

    .login-card {
      background: linear-gradient(180deg, #141414 0%, var(--bg-panel) 100%);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      width: 100%;
      max-width: 420px;
      overflow: hidden;
    }

    .login-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-color);
      background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
    }

    .tab-button {
      flex: 1;
      padding: 1rem;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all var(--transition);
      border-bottom: 2px solid transparent;
    }

    .tab-button.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
      background: var(--accent-light);
    }

    .tab-button:hover:not(.active) {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .login-form {
      padding: 2rem;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .login-header p {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
      font-weight: 600;
      font-size: 13px;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 14px;
      font-family: inherit;
      background: #1a1a1a;
      color: var(--text-primary);
      transition: all var(--transition);
      box-sizing: border-box;
    }

    .form-input::placeholder {
      color: var(--text-secondary);
    }

    .form-input:hover {
      border-color: #404040;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--accent);
      background: #0a0a0a;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .login-btn {
      width: 100%;
      margin-bottom: 1.5rem;
      padding: 12px;
      font-size: 14px;
    }

    .register-btn {
      background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
      box-shadow: 0 2px 8px rgba(39, 174, 96, 0.35);
    }

    .register-btn:hover {
      box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
    }

    .demo-credentials {
      padding: 1rem;
      background: var(--accent-light);
      border-radius: var(--radius-md);
      border: 1px solid rgba(99, 102, 241, 0.25);
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .demo-credentials strong {
      color: var(--text-primary);
    }
  `]
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private notifications = inject(NotificationService);

  isLoginMode = signal(true);
  isLoading = signal(false);

  loginData = {
    username: '',
    password: ''
  };

  registerData = {
    username: '',
    email: '',
    password: ''
  };

  onLogin() {
    if (!this.loginData.username || !this.loginData.password) {
      this.notifications.error('Por favor completa todos los campos');
      return;
    }

    this.isLoading.set(true);

    // Simular delay de red
    setTimeout(() => {
      const success = this.authService.login(this.loginData.username, this.loginData.password);
      
      if (success) {
        this.notifications.success('¡Bienvenido!');
        this.router.navigate(['/editor']);
      } else {
        this.notifications.error('Usuario o contraseña incorrectos');
      }
      
      this.isLoading.set(false);
    }, 800);
  }

  onRegister() {
    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
      this.notifications.error('Por favor completa todos los campos');
      return;
    }

    this.isLoading.set(true);

    setTimeout(() => {
      const success = this.authService.register(
        this.registerData.username,
        this.registerData.email,
        this.registerData.password
      );
      
      if (success) {
        this.notifications.success('Cuenta creada exitosamente');
        this.isLoginMode.set(true);
        this.loginData.username = this.registerData.username;
        this.registerData = { username: '', email: '', password: '' };
      } else {
        this.notifications.error('El usuario ya existe');
      }
      
      this.isLoading.set(false);
    }, 800);
  }
}