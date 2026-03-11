import { Injectable, signal } from '@angular/core';

export interface HistoryAction {
  type: 'create' | 'delete' | 'update' | 'move' | 'connection';
  timestamp: number;
  description: string;
  data: any;
  undo: () => void;
  redo: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history = signal<HistoryAction[]>([]);
  private currentIndex = signal(-1);
  private maxHistory = 50;
  private isUndoRedoing = false; // Flag para evitar registrar durante undo/redo

  canUndo = signal(false);
  canRedo = signal(false);

  addAction(action: HistoryAction) {
    // No registrar si estamos en medio de un undo/redo
    if (this.isUndoRedoing) return;

    // Eliminar acciones futuras si estamos en medio del historial
    const current = this.currentIndex();
    if (current < this.history().length - 1) {
      this.history.set(this.history().slice(0, current + 1));
    }

    // Agregar nueva acción
    const newHistory = [...this.history(), action];
    
    // Limitar tamaño del historial
    if (newHistory.length > this.maxHistory) {
      newHistory.shift();
    } else {
      this.currentIndex.set(this.currentIndex() + 1);
    }

    this.history.set(newHistory);
    this.updateCanUndoRedo();
  }

  undo() {
    const current = this.currentIndex();
    if (current >= 0) {
      this.isUndoRedoing = true;
      const action = this.history()[current];
      try {
        action.undo();
        this.currentIndex.set(current - 1);
        this.updateCanUndoRedo();
      } catch (error) {
        console.error('Error al deshacer:', error);
      } finally {
        this.isUndoRedoing = false;
      }
    }
  }

  redo() {
    const current = this.currentIndex();
    if (current < this.history().length - 1) {
      this.isUndoRedoing = true;
      const action = this.history()[current + 1];
      try {
        action.redo();
        this.currentIndex.set(current + 1);
        this.updateCanUndoRedo();
      } catch (error) {
        console.error('Error al rehacer:', error);
      } finally {
        this.isUndoRedoing = false;
      }
    }
  }

  clear() {
    this.history.set([]);
    this.currentIndex.set(-1);
    this.updateCanUndoRedo();
  }

  private updateCanUndoRedo() {
    this.canUndo.set(this.currentIndex() >= 0);
    this.canRedo.set(this.currentIndex() < this.history().length - 1);
  }

  getHistorySize(): number {
    return this.history().length;
  }

  getCurrentAction(): HistoryAction | null {
    const current = this.currentIndex();
    return current >= 0 ? this.history()[current] : null;
  }

  getNextAction(): HistoryAction | null {
    const current = this.currentIndex();
    return current < this.history().length - 1 ? this.history()[current + 1] : null;
  }
}
