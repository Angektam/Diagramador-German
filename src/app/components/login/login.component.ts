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
      <!-- Background animated shapes -->
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      
      <div class="login-card">
        <!-- Logo and Brand -->
        <div class="brand-header">
          <div class="logo-icon">📊</div>
          <h1 class="brand-name">Diagramador SQL</h1>
          <p class="brand-tagline">Crea diagramas profesionales en minutos</p>
        </div>
        
        <!-- Tabs -->
        <div class="login-tabs">
          <button 
            (click)="isLoginMode.set(true)" 
            [class.active]="isLoginMode()"
            class="tab-button">
            <span class="tab-icon">🔐</span>
            Iniciar Sesión
          </button>
          <button 
            (click)="isLoginMode.set(false)" 
            [class.active]="!isLoginMode()"
            class="tab-button">
            <span class="tab-icon">✨</span>
            Registrarse
          </button>
        </div>

        <!-- Login Form -->
        @if (isLoginMode()) {
          <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="login-form">
            <div class="form-group">
              <label>
                <span class="label-icon">👤</span>
                Usuario
              </label>
              <input 
                type="text" 
                [(ngModel)]="loginData.username" 
                name="username" 
                placeholder="Ingresa tu usuario" 
                required 
                class="form-input"
                [class.has-value]="loginData.username">
            </div>
            
            <div class="form-group">
              <label>
                <span class="label-icon">🔒</span>
                Contraseña
              </label>
              <div class="password-wrapper">
                <input 
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="loginData.password" 
                  name="password" 
                  placeholder="Ingresa tu contraseña" 
                  required 
                  class="form-input"
                  [class.has-value]="loginData.password">
                <button 
                  type="button"
                  class="toggle-password"
                  (click)="showPassword.set(!showPassword())"
                  title="Mostrar/Ocultar contraseña">
                  {{ showPassword() ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
            </div>
            
            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" [(ngModel)]="rememberMe" name="remember">
                <span>Recordarme</span>
              </label>
              <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            
            <button 
              type="submit" 
              [disabled]="!loginForm.valid || isLoading()"
              class="btn-primary login-btn">
              @if (isLoading()) {
                <span class="spinner-small"></span>
                <span>Entrando...</span>
              } @else {
                <span>Iniciar Sesión</span>
                <span class="btn-arrow">→</span>
              }
            </button>

            <!-- Demo credentials -->
            <div class="demo-credentials">
              <div class="demo-header">
                <span class="demo-icon">🎯</span>
                <strong>Usuarios de prueba</strong>
              </div>
              <div class="demo-list">
                <button type="button" class="demo-user" (click)="fillDemo('admin', 'admin123')">
                  <span class="demo-badge admin">Admin</span>
                  <span class="demo-info">admin / admin123</span>
                </button>
                <button type="button" class="demo-user" (click)="fillDemo('usuario', '123456')">
                  <span class="demo-badge user">Usuario</span>
                  <span class="demo-info">usuario / 123456</span>
                </button>
                <button type="button" class="demo-user" (click)="fillDemo('demo', 'demo')">
                  <span class="demo-badge demo">Demo</span>
                  <span class="demo-info">demo / demo</span>
                </button>
              </div>
            </div>
          </form>
        }

        <!-- Register Form -->
        @if (!isLoginMode()) {
          <form (ngSubmit)="onRegister()" #registerForm="ngForm" class="login-form">
            <div class="form-group">
              <label>
                <span class="label-icon">👤</span>
                Usuario
              </label>
              <input 
                type="text" 
                [(ngModel)]="registerData.username" 
                name="regUsername" 
                placeholder="Elige un nombre de usuario" 
                required 
                minlength="3"
                class="form-input"
                [class.has-value]="registerData.username">
              <small class="input-hint">Mínimo 3 caracteres</small>
            </div>
            
            <div class="form-group">
              <label>
                <span class="label-icon">📧</span>
                Email
              </label>
              <input 
                type="email" 
                [(ngModel)]="registerData.email" 
                name="email" 
                placeholder="tu@email.com" 
                required 
                class="form-input"
                [class.has-value]="registerData.email">
            </div>
            
            <div class="form-group">
              <label>
                <span class="label-icon">🔒</span>
                Contraseña
              </label>
              <div class="password-wrapper">
                <input 
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="registerData.password" 
                  name="regPassword" 
                  placeholder="Mínimo 6 caracteres" 
                  required 
                  minlength="6"
                  class="form-input"
                  [class.has-value]="registerData.password">
                <button 
                  type="button"
                  class="toggle-password"
                  (click)="showPassword.set(!showPassword())"
                  title="Mostrar/Ocultar contraseña">
                  {{ showPassword() ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <div class="password-strength">
                <div class="strength-bar" [class.weak]="getPasswordStrength() === 'weak'" 
                     [class.medium]="getPasswordStrength() === 'medium'"
                     [class.strong]="getPasswordStrength() === 'strong'"></div>
                <small class="strength-text">{{ getPasswordStrengthText() }}</small>
              </div>
            </div>
            
            <button 
              type="submit" 
              [disabled]="!registerForm.valid || isLoading()"
              class="btn-primary login-btn register-btn">
              @if (isLoading()) {
                <span class="spinner-small"></span>
                <span>Creando cuenta...</span>
              } @else {
                <span>Crear Cuenta</span>
                <span class="btn-arrow">→</span>
              }
            </button>
            
            <div class="register-benefits">
              <div class="benefit">
                <span class="benefit-icon">✓</span>
                <span>Diagramas ilimitados</span>
              </div>
              <div class="benefit">
                <span class="benefit-icon">✓</span>
                <span>Exportar a SQL</span>
              </div>
              <div class="benefit">
                <span class="benefit-icon">✓</span>
                <span>Colaboración en tiempo real</span>
              </div>
            </div>
          </form>
        }
      </div>
      
      <!-- Footer -->
      <div class="login-footer">
        <p>© 2026 Diagramador SQL • Hecho con ❤️</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: #0a0a0a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    /* Animated background shapes */
    .bg-shapes {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }
    
    .shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
      animation: float 20s ease-in-out infinite;
    }
    
    .shape-1 {
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      top: -200px;
      left: -200px;
      animation-delay: 0s;
    }
    
    .shape-2 {
      width: 500px;
      height: 500px;
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      bottom: -250px;
      right: -250px;
      animation-delay: 7s;
    }
    
    .shape-3 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 14s;
    }
    
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }

    .login-card {
      background: linear-gradient(180deg, rgba(20, 20, 20, 0.95) 0%, rgba(17, 17, 17, 0.95) 100%);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      width: 100%;
      max-width: 460px;
      overflow: hidden;
      position: relative;
      z-index: 1;
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .brand-header {
      text-align: center;
      padding: 2.5rem 2rem 1.5rem;
      background: linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .logo-icon {
      font-size: 56px;
      margin-bottom: 1rem;
      animation: bounce 2s ease-in-out infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .brand-name {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }
    
    .brand-tagline {
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
    }

    .login-tabs {
      display: flex;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(0, 0, 0, 0.2);
      padding: 0.5rem;
      gap: 0.5rem;
    }

    .tab-button {
      flex: 1;
      padding: 0.875rem 1rem;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .tab-icon {
      font-size: 16px;
    }

    .tab-button.active {
      color: #fff;
      background: linear-gradient(135deg, var(--accent), var(--accent-hover));
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      transform: translateY(-2px);
    }

    .tab-button:hover:not(.active) {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .login-form {
      padding: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.625rem;
      color: var(--text-primary);
      font-weight: 600;
      font-size: 13px;
    }
    
    .label-icon {
      font-size: 16px;
    }
    
    .password-wrapper {
      position: relative;
    }
    
    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    
    .toggle-password:hover {
      opacity: 1;
    }

    .form-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      font-size: 14px;
      font-family: inherit;
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-primary);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
    }
    
    .password-wrapper .form-input {
      padding-right: 45px;
    }

    .form-input::placeholder {
      color: rgba(148, 163, 184, 0.5);
    }

    .form-input:hover {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.05);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--accent);
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }
    
    .form-input.has-value {
      border-color: rgba(99, 102, 241, 0.3);
    }
    
    .input-hint {
      display: block;
      margin-top: 0.5rem;
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .remember-me {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 13px;
      color: var(--text-secondary);
      cursor: pointer;
    }
    
    .remember-me input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    
    .forgot-password {
      font-size: 13px;
      color: var(--accent);
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .forgot-password:hover {
      color: var(--accent-hover);
      text-decoration: underline;
    }
    
    .password-strength {
      margin-top: 0.5rem;
    }
    
    .strength-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      position: relative;
    }
    
    .strength-bar::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 0;
      transition: all 0.3s;
    }
    
    .strength-bar.weak::after {
      width: 33%;
      background: #ef4444;
    }
    
    .strength-bar.medium::after {
      width: 66%;
      background: #f59e0b;
    }
    
    .strength-bar.strong::after {
      width: 100%;
      background: #10b981;
    }
    
    .strength-text {
      display: block;
      margin-top: 0.25rem;
      font-size: 11px;
      color: var(--text-secondary);
    }

    .login-btn {
      width: 100%;
      margin-bottom: 1.5rem;
      padding: 14px 24px;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      position: relative;
      overflow: hidden;
    }
    
    .login-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transform: translateX(-100%);
      transition: transform 0.6s;
    }
    
    .login-btn:hover::before {
      transform: translateX(100%);
    }
    
    .btn-arrow {
      font-size: 18px;
      transition: transform 0.3s;
    }
    
    .login-btn:hover .btn-arrow {
      transform: translateX(4px);
    }
    
    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .register-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .register-btn:hover {
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
      transform: translateY(-2px);
    }

    .demo-credentials {
      padding: 1.25rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
      border-radius: 16px;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }
    
    .demo-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
      font-weight: 600;
      font-size: 13px;
    }
    
    .demo-icon {
      font-size: 18px;
    }
    
    .demo-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .demo-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      width: 100%;
    }
    
    .demo-user:hover {
      background: rgba(99, 102, 241, 0.2);
      border-color: var(--accent);
      transform: translateX(4px);
    }
    
    .demo-badge {
      padding: 0.25rem 0.625rem;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .demo-badge.admin {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #fff;
    }
    
    .demo-badge.user {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: #fff;
    }
    
    .demo-badge.demo {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: #fff;
    }
    
    .demo-info {
      font-size: 12px;
      color: var(--text-secondary);
      font-family: 'Courier New', monospace;
    }
    
    .register-benefits {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.25rem;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 16px;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    
    .benefit {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 13px;
      color: var(--text-primary);
    }
    
    .benefit-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 50%;
      color: #fff;
      font-weight: 700;
      font-size: 12px;
      flex-shrink: 0;
    }
    
    .login-footer {
      margin-top: 2rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 13px;
      position: relative;
      z-index: 1;
    }
  `]
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private notifications = inject(NotificationService);

  isLoginMode = signal(true);
  isLoading = signal(false);
  showPassword = signal(false);
  rememberMe = false;

  loginData = {
    username: '',
    password: ''
  };

  registerData = {
    username: '',
    email: '',
    password: ''
  };
  
  fillDemo(username: string, password: string) {
    this.loginData.username = username;
    this.loginData.password = password;
    this.notifications.success(`Credenciales de ${username} cargadas`);
  }
  
  getPasswordStrength(): 'weak' | 'medium' | 'strong' | '' {
    const password = this.registerData.password;
    if (!password) return '';
    
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (strength >= 3) return 'strong';
    if (strength >= 2) return 'medium';
    return 'weak';
  }
  
  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Contraseña débil';
      case 'medium': return 'Contraseña media';
      case 'strong': return 'Contraseña fuerte';
      default: return '';
    }
  }

  onLogin() {
    // Validación de campos vacíos
    if (!this.loginData.username || !this.loginData.password) {
      this.notifications.error('Por favor completa todos los campos');
      return;
    }

    // Validación de longitud mínima
    if (this.loginData.username.trim().length < 3) {
      this.notifications.error('El usuario debe tener al menos 3 caracteres');
      return;
    }

    if (this.loginData.password.length < 4) {
      this.notifications.error('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    // Validación de caracteres especiales peligrosos
    const dangerousChars = /[<>\"\']/;
    if (dangerousChars.test(this.loginData.username) || dangerousChars.test(this.loginData.password)) {
      this.notifications.error('Los campos contienen caracteres no permitidos');
      return;
    }

    this.isLoading.set(true);

    // Simular delay de red
    setTimeout(() => {
      const success = this.authService.login(this.loginData.username.trim(), this.loginData.password);
      
      if (success) {
        this.notifications.success(`¡Bienvenido ${this.loginData.username}!`);
        this.router.navigate(['/editor']);
      } else {
        this.notifications.error('Usuario o contraseña incorrectos');
      }
      
      this.isLoading.set(false);
    }, 1000);
  }

  onRegister() {
    // Validación de campos vacíos
    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
      this.notifications.error('Por favor completa todos los campos');
      return;
    }

    // Validación de longitud de usuario
    if (this.registerData.username.trim().length < 3) {
      this.notifications.error('El usuario debe tener al menos 3 caracteres');
      return;
    }

    if (this.registerData.username.trim().length > 50) {
      this.notifications.error('El usuario no puede exceder 50 caracteres');
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email.trim())) {
      this.notifications.error('Por favor ingresa un email válido');
      return;
    }

    // Validación de longitud de contraseña
    if (this.registerData.password.length < 6) {
      this.notifications.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.registerData.password.length > 100) {
      this.notifications.error('La contraseña no puede exceder 100 caracteres');
      return;
    }

    // Validación de caracteres especiales peligrosos
    const dangerousChars = /[<>\"\']/;
    if (dangerousChars.test(this.registerData.username) || 
        dangerousChars.test(this.registerData.email) || 
        dangerousChars.test(this.registerData.password)) {
      this.notifications.error('Los campos contienen caracteres no permitidos');
      return;
    }

    // Validación de fortaleza de contraseña
    if (this.getPasswordStrength() === 'weak') {
      this.notifications.warning('Tu contraseña es débil. Considera usar una más fuerte.');
    }

    this.isLoading.set(true);

    setTimeout(() => {
      const success = this.authService.register(
        this.registerData.username.trim(),
        this.registerData.email.trim().toLowerCase(),
        this.registerData.password
      );
      
      if (success) {
        this.notifications.success('¡Cuenta creada exitosamente! 🎉');
        this.isLoginMode.set(true);
        this.loginData.username = this.registerData.username.trim();
        this.registerData = { username: '', email: '', password: '' };
      } else {
        this.notifications.error('El usuario ya existe');
      }
      
      this.isLoading.set(false);
    }, 1000);
  }
}