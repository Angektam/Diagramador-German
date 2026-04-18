import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
    <div class="wrap">
      <div class="code">404</div>
      <h1>Página no encontrada</h1>
      <p>La ruta que buscas no existe.</p>
      <button class="btn" (click)="router.navigate(['/dashboard'])">← Volver al inicio</button>
    </div>
  `,
  styles: [`
    :host { display: flex; position: fixed; inset: 0; align-items: center; justify-content: center;
      background: #f0f2f8; font-family: 'Inter', system-ui, sans-serif; }
    .wrap { text-align: center; }
    .code { font-size: 96px; font-weight: 900; background: linear-gradient(135deg, #6d28d9, #8b5cf6);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    p { font-size: 15px; color: #64748b; margin-bottom: 28px; }
    .btn { padding: 12px 28px; background: linear-gradient(135deg, #6d28d9, #8b5cf6); color: #fff;
      border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
      box-shadow: 0 2px 8px rgba(109,40,217,.3); transition: transform .15s, box-shadow .15s; }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(109,40,217,.4); }
  `]
})
export class NotFoundComponent {
  router = inject(Router);
}
