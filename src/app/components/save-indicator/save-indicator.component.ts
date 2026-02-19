import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramService } from '../../services/diagram.service';

type SaveStatus = 'saved' | 'saving' | 'unsaved';

@Component({
  selector: 'app-save-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="save-indicator" [class]="'status-' + status()">
      <div class="indicator-content">
        @switch (status()) {
          @case ('saved') {
            <span class="icon">✓</span>
            <span class="text">Guardado</span>
          }
          @case ('saving') {
            <span class="icon spinner">⟳</span>
            <span class="text">Guardando...</span>
          }
          @case ('unsaved') {
            <span class="icon">●</span>
            <span class="text">Sin guardar</span>
          }
        }
      </div>
      <div class="last-save" *ngIf="lastSaveTime()">
        {{ formatLastSave(lastSaveTime()!) }}
      </div>
    </div>
  `,
  styles: [`
    .save-indicator {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.3s ease;
      user-select: none;
    }

    .indicator-content {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
    }

    .icon {
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .text {
      font-weight: 500;
    }

    .last-save {
      font-size: 11px;
      opacity: 0.7;
      font-weight: 400;
    }

    /* Estado: Guardado */
    .status-saved {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .status-saved .icon {
      color: #22c55e;
    }

    .status-saved .text {
      color: #22c55e;
    }

    /* Estado: Guardando */
    .status-saving {
      background: rgba(251, 191, 36, 0.15);
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .status-saving .icon {
      color: #f59e0b;
    }

    .status-saving .text {
      color: #f59e0b;
    }

    /* Estado: Sin guardar */
    .status-unsaved {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .status-unsaved .icon {
      color: #ef4444;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    .status-unsaved .text {
      color: #ef4444;
    }

    @keyframes pulse-dot {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(0.8);
      }
    }

    /* Tema claro */
    :host-context(body.theme-light) .status-saved {
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.25);
    }

    :host-context(body.theme-light) .status-saving {
      background: rgba(251, 191, 36, 0.1);
      border-color: rgba(251, 191, 36, 0.25);
    }

    :host-context(body.theme-light) .status-unsaved {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.25);
    }

    :host-context(body.theme-light) .last-save {
      color: #64748b;
    }
  `]
})
export class SaveIndicatorComponent {
  private diagram = inject(DiagramService);
  
  status = signal<SaveStatus>('saved');
  lastSaveTime = signal<Date | null>(null);
  private saveTimeout: any;
  private previousShapesCount = 0;

  constructor() {
    // Observar cambios en el diagrama
    effect(() => {
      const shapes = this.diagram.shapes();
      const connections = this.diagram.connections();
      
      // Si hay cambios, marcar como sin guardar
      if (shapes.length !== this.previousShapesCount) {
        this.previousShapesCount = shapes.length;
        this.markAsUnsaved();
      }
    });
  }

  private markAsUnsaved(): void {
    this.status.set('unsaved');
    
    // Cancelar guardado anterior si existe
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Auto-guardar después de 2 segundos de inactividad
    this.saveTimeout = setTimeout(() => {
      this.save();
    }, 2000);
  }

  private save(): void {
    this.status.set('saving');
    
    // Simular guardado (aquí iría la lógica real de guardado)
    setTimeout(() => {
      this.status.set('saved');
      this.lastSaveTime.set(new Date());
    }, 500);
  }

  formatLastSave(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return 'Hace unos segundos';
    } else if (minutes < 60) {
      return `Hace ${minutes} min`;
    } else if (hours < 24) {
      return `Hace ${hours} h`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
