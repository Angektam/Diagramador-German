import { Injectable, signal } from '@angular/core';
import { ContextMenuItem } from '../components/context-menu/context-menu.component';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {
  private menuRef = signal<any>(null);

  setMenuRef(ref: any) {
    this.menuRef.set(ref);
  }

  showShapeMenu(x: number, y: number, shapeId: string, hasSelection: boolean, onAction: (action: string, shapeId: string) => void) {
    const items: ContextMenuItem[] = [
      { icon: '✏️', label: 'Editar', action: 'edit', shortcut: 'Enter' },
      { icon: '📋', label: 'Duplicar', action: 'duplicate', shortcut: 'Ctrl+D' },
      { divider: true, icon: '', label: '', action: '' },
      { icon: '📄', label: 'Copiar', action: 'copy', shortcut: 'Ctrl+C' },
      { icon: '✂️', label: 'Cortar', action: 'cut', shortcut: 'Ctrl+X' },
      { icon: '📋', label: 'Pegar', action: 'paste', shortcut: 'Ctrl+V', disabled: true },
      { divider: true, icon: '', label: '', action: '' },
      { icon: '⬆️', label: 'Traer al frente', action: 'bringToFront' },
      { icon: '⬇️', label: 'Enviar atrás', action: 'sendToBack' },
      { divider: true, icon: '', label: '', action: '' },
      { icon: '🎨', label: 'Cambiar color', action: 'changeColor' },
      { icon: '📏', label: 'Alinear', action: 'align', disabled: !hasSelection },
      { divider: true, icon: '', label: '', action: '' },
      { icon: '🗑️', label: 'Eliminar', action: 'delete', shortcut: 'Del' }
    ];

    const menu = this.menuRef();
    if (menu) {
      menu.show(x, y, items, (action: string) => onAction(action, shapeId));
    }
  }

  showCanvasMenu(x: number, y: number, onAction: (action: string) => void) {
    const items: ContextMenuItem[] = [
      { icon: '📋', label: 'Pegar', action: 'paste', shortcut: 'Ctrl+V', disabled: true },
      { divider: true, icon: '', label: '', action: '' },
      { icon: '🔍', label: 'Zoom In', action: 'zoomIn', shortcut: 'Ctrl++' },
      { icon: '🔍', label: 'Zoom Out', action: 'zoomOut', shortcut: 'Ctrl+-' },
      { icon: '🔍', label: 'Ajustar al 100%', action: 'zoomReset', shortcut: 'Ctrl+0' },
      { divider: true, icon: '', label: '', action: '' },
      { icon: '✅', label: 'Seleccionar todo', action: 'selectAll', shortcut: 'Ctrl+A' },
      { icon: '🧹', label: 'Limpiar canvas', action: 'clearCanvas' }
    ];

    const menu = this.menuRef();
    if (menu) {
      menu.show(x, y, items, onAction);
    }
  }

  showConnectionMenu(x: number, y: number, connectionId: string, onAction: (action: string, connectionId: string) => void) {
    const items: ContextMenuItem[] = [
      { icon: '✏️', label: 'Editar relación', action: 'editConnection' },
      { icon: '🎨', label: 'Cambiar estilo', action: 'changeStyle' },
      { divider: true, icon: '', label: '', action: '' },
      { icon: '🗑️', label: 'Eliminar', action: 'delete', shortcut: 'Del' }
    ];

    const menu = this.menuRef();
    if (menu) {
      menu.show(x, y, items, (action: string) => onAction(action, connectionId));
    }
  }

  hide() {
    const menu = this.menuRef();
    if (menu) {
      menu.hide();
    }
  }
}
