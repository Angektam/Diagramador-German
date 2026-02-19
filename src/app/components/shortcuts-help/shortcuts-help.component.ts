import { Component, inject, signal } from '@angular/core';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shortcuts-help',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="shortcuts-overlay" (click)="close()">
        <div class="shortcuts-modal" (click)="$event.stopPropagation()">
          <div class="shortcuts-header">
            <h2>⌨️ Atajos de Teclado</h2>
            <button class="close-btn" (click)="close()">×</button>
          </div>
          
          <div class="shortcuts-body">
            <div class="shortcuts-grid">
              @for (shortcut of shortcuts.getShortcuts(); track shortcut.key) {
                <div class="shortcut-item">
                  <div class="shortcut-keys">
                    <kbd>{{ shortcuts.getShortcutText(shortcut) }}</kbd>
                  </div>
                  <div class="shortcut-desc">{{ shortcut.description }}</div>
                </div>
              }
            </div>
          </div>
          
          <div class="shortcuts-footer">
            <p>Presiona <kbd>?</kbd> para abrir/cerrar esta ayuda</p>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .shortcuts-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .shortcuts-modal {
      background: linear-gradient(180deg, #141414 0%, #111 100%);
      border-radius: 16px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      border: 1px solid #2a2a2a;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .shortcuts-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #2a2a2a;
      background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
      border-radius: 16px 16px 0 0;
    }

    .shortcuts-header h2 {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      color: #f1f5f9;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      font-size: 28px;
      cursor: pointer;
      color: #94a3b8;
      line-height: 1;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(99, 102, 241, 0.2);
      color: #6366f1;
    }

    .shortcuts-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .shortcuts-body::-webkit-scrollbar {
      width: 10px;
    }

    .shortcuts-body::-webkit-scrollbar-track {
      background: rgba(10, 10, 10, 0.5);
      border-radius: 5px;
    }

    .shortcuts-body::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #454545 0%, #353535 100%);
      border-radius: 5px;
      border: 2px solid rgba(10, 10, 10, 0.5);
    }

    .shortcuts-body::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #555555 0%, #454545 100%);
    }

    .shortcuts-grid {
      display: grid;
      gap: 12px;
    }

    .shortcut-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      background: linear-gradient(135deg, #1a1a1a 0%, #222 100%);
      border-radius: 10px;
      border: 1px solid #2a2a2a;
      transition: all 0.2s;
    }

    .shortcut-item:hover {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.1);
      transform: translateX(4px);
    }

    .shortcut-keys {
      display: flex;
      gap: 6px;
    }

    kbd {
      display: inline-block;
      padding: 6px 12px;
      background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
      border: 1px solid #404040;
      border-radius: 6px;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 13px;
      font-weight: 600;
      color: #f1f5f9;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.3);
      min-width: 32px;
      text-align: center;
    }

    .shortcut-desc {
      font-size: 14px;
      color: #94a3b8;
      font-weight: 500;
    }

    .shortcuts-footer {
      padding: 16px 24px;
      border-top: 1px solid #2a2a2a;
      background: #1a1a1a;
      border-radius: 0 0 16px 16px;
      text-align: center;
    }

    .shortcuts-footer p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
    }

    .shortcuts-footer kbd {
      font-size: 12px;
      padding: 4px 8px;
    }

    /* Tema claro */
    :host-context(body.theme-light) .shortcuts-modal {
      background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
      border-color: #e2e8f0;
    }

    :host-context(body.theme-light) .shortcuts-header {
      background: linear-gradient(180deg, #f8f9fa 0%, #f1f5f9 100%);
      border-color: #e2e8f0;
    }

    :host-context(body.theme-light) .shortcuts-header h2 {
      color: #1e293b;
    }

    :host-context(body.theme-light) .close-btn {
      color: #64748b;
    }

    :host-context(body.theme-light) .shortcut-item {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-color: #e2e8f0;
    }

    :host-context(body.theme-light) kbd {
      background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
      border-color: #cbd5e1;
      color: #1e293b;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05), inset 0 -2px 0 rgba(0, 0, 0, 0.05);
    }

    :host-context(body.theme-light) .shortcut-desc {
      color: #64748b;
    }

    :host-context(body.theme-light) .shortcuts-footer {
      background: #f8f9fa;
      border-color: #e2e8f0;
    }

    :host-context(body.theme-light) .shortcuts-footer p {
      color: #64748b;
    }
  `]
})
export class ShortcutsHelpComponent {
  shortcuts = inject(KeyboardShortcutsService);
  isOpen = signal(false);

  constructor() {
    // Escuchar tecla ? para abrir/cerrar
    document.addEventListener('keydown', (e) => {
      if (e.key === '?' && !this.isInputFocused()) {
        e.preventDefault();
        this.toggle();
      }
      // ESC para cerrar
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Escuchar evento personalizado del toolbar
    window.addEventListener('open-shortcuts-help', () => {
      this.open();
    });
  }

  private isInputFocused(): boolean {
    const target = document.activeElement as HTMLElement;
    return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }
}
