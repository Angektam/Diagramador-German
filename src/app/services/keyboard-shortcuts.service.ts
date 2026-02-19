import { Injectable, inject } from '@angular/core';
import { DiagramService } from './diagram.service';
import { NotificationService } from './notification.service';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService {
  private diagram = inject(DiagramService);
  private notifications = inject(NotificationService);
  
  private shortcuts: Shortcut[] = [
    {
      key: 'Delete',
      description: 'Eliminar selección',
      action: () => this.diagram.deleteSelectedShapes()
    },
    {
      key: 'c',
      ctrl: true,
      description: 'Copiar',
      action: () => this.notifications.info('Copiar (Ctrl+C)')
    },
    {
      key: 'v',
      ctrl: true,
      description: 'Pegar',
      action: () => this.notifications.info('Pegar (Ctrl+V)')
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Duplicar',
      action: () => this.notifications.info('Duplicar (Ctrl+D)')
    },
    {
      key: 'a',
      ctrl: true,
      description: 'Seleccionar todo',
      action: () => this.diagram.selectAllShapes()
    },
    {
      key: 'z',
      ctrl: true,
      description: 'Deshacer',
      action: () => this.notifications.info('Deshacer (próximamente)')
    },
    {
      key: 'y',
      ctrl: true,
      description: 'Rehacer',
      action: () => this.notifications.info('Rehacer (próximamente)')
    },
    {
      key: 's',
      ctrl: true,
      description: 'Guardar',
      action: () => this.notifications.info('Guardado automático activo')
    },
    {
      key: 'Escape',
      description: 'Deseleccionar todo',
      action: () => this.diagram.clearSelection()
    },
    {
      key: '+',
      ctrl: true,
      description: 'Acercar zoom',
      action: () => this.diagram.setZoom(this.diagram.zoomLevel() + 10)
    },
    {
      key: '-',
      ctrl: true,
      description: 'Alejar zoom',
      action: () => this.diagram.setZoom(this.diagram.zoomLevel() - 10)
    },
    {
      key: '0',
      ctrl: true,
      description: 'Restablecer zoom',
      action: () => this.diagram.setZoom(100)
    }
  ];

  initialize(): void {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Ignorar si está escribiendo en un input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const shortcut = this.shortcuts.find(s => 
      s.key.toLowerCase() === event.key.toLowerCase() &&
      !!s.ctrl === event.ctrlKey &&
      !!s.shift === event.shiftKey &&
      !!s.alt === event.altKey
    );

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }

  getShortcuts(): Shortcut[] {
    return this.shortcuts;
  }

  getShortcutText(shortcut: Shortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key === ' ' ? 'Space' : shortcut.key);
    return parts.join(' + ');
  }
}
