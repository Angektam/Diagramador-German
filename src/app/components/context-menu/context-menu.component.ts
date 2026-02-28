import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ContextMenuItem {
  icon: string;
  label: string;
  action: string;
  shortcut?: string;
  divider?: boolean;
  disabled?: boolean;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="visible()"
      class="context-menu"
      [style.left.px]="position().x"
      [style.top.px]="position().y"
      (click)="$event.stopPropagation()">
      
      <div *ngFor="let item of items()" 
           [class.menu-divider]="item.divider"
           [class.menu-item-disabled]="item.disabled">
        
        <button 
          *ngIf="!item.divider"
          class="menu-item"
          [disabled]="item.disabled"
          (click)="onItemClick(item)">
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
          <span *ngIf="item.shortcut" class="menu-shortcut">{{ item.shortcut }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .context-menu {
      position: fixed;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 4px;
      min-width: 200px;
      z-index: 10000;
      animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 8px 12px;
      border: none;
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      transition: background 0.15s;
    }

    .menu-item:hover:not(:disabled) {
      background: var(--bg-secondary);
    }

    .menu-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .menu-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .menu-label {
      flex: 1;
      text-align: left;
    }

    .menu-shortcut {
      font-size: 12px;
      color: var(--text-secondary);
      font-family: monospace;
    }

    .menu-divider {
      height: 1px;
      background: var(--border);
      margin: 4px 0;
    }

    .menu-item-disabled {
      opacity: 0.5;
    }
  `]
})
export class ContextMenuComponent {
  visible = signal(false);
  position = signal<ContextMenuPosition>({ x: 0, y: 0 });
  items = signal<ContextMenuItem[]>([]);
  private onActionCallback?: (action: string) => void;

  constructor() {
    // Cerrar menú al hacer click fuera
    effect(() => {
      if (this.visible()) {
        const closeMenu = () => this.hide();
        setTimeout(() => {
          document.addEventListener('click', closeMenu, { once: true });
          document.addEventListener('contextmenu', closeMenu, { once: true });
        }, 0);
      }
    });
  }

  show(x: number, y: number, items: ContextMenuItem[], onAction: (action: string) => void) {
    // Ajustar posición si el menú se sale de la pantalla
    const menuWidth = 200;
    const menuHeight = items.length * 40;
    
    const adjustedX = x + menuWidth > window.innerWidth 
      ? window.innerWidth - menuWidth - 10 
      : x;
    
    const adjustedY = y + menuHeight > window.innerHeight 
      ? window.innerHeight - menuHeight - 10 
      : y;

    this.position.set({ x: adjustedX, y: adjustedY });
    this.items.set(items);
    this.onActionCallback = onAction;
    this.visible.set(true);
  }

  hide() {
    this.visible.set(false);
  }

  onItemClick(item: ContextMenuItem) {
    if (!item.disabled && this.onActionCallback) {
      this.onActionCallback(item.action);
      this.hide();
    }
  }
}
