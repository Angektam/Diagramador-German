import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShareService } from '../../services/share.service';
import { ClipboardService } from '../../services/clipboard.service';

@Component({
  selector: 'app-share-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wrap">
      @if (error) {
        <div class="error-state">
          <div class="code">⚠️</div>
          <h1>Enlace inválido</h1>
          <p>El prompt compartido no se pudo cargar.</p>
          <button class="btn" (click)="router.navigate(['/dashboard'])">← Ir al inicio</button>
        </div>
      } @else if (content) {
        <div class="viewer">
          <div class="viewer-header">
            <div class="brand">📄 PromptGen</div>
            <div class="actions">
              <button class="btn-copy" [class.copied]="copied" (click)="copy()">
                {{ copied ? '✓ Copiado' : '📋 Copiar prompt' }}
              </button>
              <button class="btn-outline" (click)="router.navigate(['/dashboard'])">Abrir app →</button>
            </div>
          </div>
          <div class="meta-bar">
            <span class="meta-pill">📝 {{ wordCount }} palabras</span>
            <span class="meta-pill">~{{ tokenEstimate }} tokens</span>
            <span class="meta-pill shared-badge">🔗 Prompt compartido</span>
          </div>
          <div class="prompt-box">
            <pre>{{ content }}</pre>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: flex; position: fixed; inset: 0; background: #0f1117; font-family: 'Inter', system-ui, sans-serif; color: #f1f5f9; }
    .wrap { width: 100%; height: 100%; overflow-y: auto; }
    .error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; }
    .code { font-size: 64px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    p { color: #94a3b8; margin-bottom: 24px; }
    .btn { padding: 12px 28px; background: linear-gradient(135deg, #6d28d9, #8b5cf6); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .viewer { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
    .viewer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .brand { font-size: 18px; font-weight: 800; background: linear-gradient(135deg, #6d28d9, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .actions { display: flex; gap: 10px; }
    .btn-copy { padding: 10px 20px; background: linear-gradient(135deg, #6d28d9, #8b5cf6); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
    .btn-copy.copied { background: linear-gradient(135deg, #16a34a, #22c55e); }
    .btn-outline { padding: 10px 20px; background: transparent; color: #94a3b8; border: 1px solid #2d3148; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; }
    .btn-outline:hover { border-color: #8b5cf6; color: #8b5cf6; }
    .meta-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .meta-pill { padding: 4px 12px; background: #1a1d27; border: 1px solid #2d3148; border-radius: 20px; font-size: 12px; color: #94a3b8; }
    .shared-badge { border-color: rgba(139,92,246,.4); color: #8b5cf6; background: rgba(109,40,217,.15); }
    .prompt-box { background: #0d1117; border-radius: 16px; padding: 24px; border: 1px solid #1e2235; }
    pre { color: #cdd9e5; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; margin: 0; }
  `]
})
export class ShareViewComponent implements OnInit {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private shareService = inject(ShareService);
  private clipboard = inject(ClipboardService);

  content = '';
  error = false;
  copied = false;

  get wordCount() { return this.content.split(/\s+/).filter(Boolean).length; }
  get tokenEstimate() { return Math.round(this.wordCount * 1.3).toLocaleString('es-ES'); }

  async ngOnInit() {
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) { this.error = true; return; }
      this.content = await this.shareService.get(id);
    } catch { this.error = true; }
  }

  async copy() {
    const ok = await this.clipboard.copyText(this.content, '');
    if (ok) {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    }
  }
}
