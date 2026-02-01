import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiagramService } from '../../services/diagram.service';

interface ShapeDef {
  shape: string;
  title: string;
  category: string;
  table?: boolean;
}

const SHAPE_DEFS: ShapeDef[] = [
  { shape: 'rect', title: 'Rectángulo', category: 'flow' },
  { shape: 'rounded', title: 'Rectángulo redondeado', category: 'flow' },
  { shape: 'diamond', title: 'Rombo', category: 'flow' },
  { shape: 'ellipse', title: 'Elipse', category: 'flow' },
  { shape: 'parallelogram', title: 'Paralelogramo', category: 'flow' },
  { shape: 'hexagon', title: 'Hexágono', category: 'flow' },
  { shape: 'arrow-right', title: 'Flecha derecha', category: 'arrows' },
  { shape: 'arrow-down', title: 'Flecha abajo', category: 'arrows' },
  { shape: 'table', title: 'Tabla', category: 'database', table: true },
  { shape: 'view', title: 'Vista', category: 'database', table: true },
  { shape: 'procedure', title: 'Procedimiento', category: 'database' },
  { shape: 'database', title: 'Base de datos', category: 'database' },
  { shape: 'schema', title: 'Esquema', category: 'database' },
  { shape: 'trigger', title: 'Trigger', category: 'database' },
];

@Component({
  selector: 'app-shapes-panel',
  standalone: true,
  imports: [FormsModule],
  template: `
    <aside class="shapes-panel">
      <div class="panel-header">
        <span>Formas</span>
        <input type="text" class="shape-search" placeholder="Buscar..." [ngModel]="search()" (ngModelChange)="search.set($event)">
      </div>
      <div class="shape-categories">
        @for (cat of categories; track cat.name) {
          <details [open]="cat.open">
            <summary>{{ cat.name }}</summary>
            <div class="shape-list">
              @for (item of getShapesForCategory(cat.key); track item.shape) {
                <div class="shape-item" [attr.data-shape]="item.shape" [title]="item.title"
                     draggable="true" (dragstart)="onDragStart($event, item)">
                  @switch (item.shape) {
                    @case ('rect') {
                      <svg viewBox="0 0 100 60" width="48" height="28"><rect x="5" y="5" width="90" height="50" rx="4" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('rounded') {
                      <svg viewBox="0 0 100 60" width="48" height="28"><rect x="5" y="5" width="90" height="50" rx="12" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('diamond') {
                      <svg viewBox="0 0 100 60" width="48" height="28"><polygon points="50,5 95,30 50,55 5,30" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('ellipse') {
                      <svg viewBox="0 0 100 60" width="48" height="28"><ellipse cx="50" cy="30" rx="45" ry="25" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('parallelogram') {
                      <svg viewBox="0 0 100 60" width="48" height="28"><polygon points="25,5 95,5 75,55 5,55" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('hexagon') {
                      <svg viewBox="0 0 100 60" width="48" height="28"><polygon points="25,5 75,5 95,30 75,55 25,55 5,30" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('arrow-right') {
                      <svg viewBox="0 0 100 40" width="48" height="20"><polygon points="5,20 75,5 75,15 95,20 75,25 75,35" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('arrow-down') {
                      <svg viewBox="0 0 40 100" width="20" height="48"><polygon points="20,95 5,25 15,25 15,5 25,5 25,25 35,25" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('table') {
                      <svg viewBox="0 0 120 70" width="56" height="36">
                        <rect x="2" y="2" width="116" height="24" rx="2" fill="#6366f1" stroke="#4f46e5"/>
                        <text x="60" y="17" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Tabla</text>
                        <line x1="2" y1="26" x2="118" y2="26" stroke="#e2e8f0"/>
                        <rect x="2" y="26" width="116" height="20" fill="#f8fafc" stroke="#e2e8f0"/>
                        <text x="8" y="40" font-size="10" fill="#334155">id INT PK</text>
                        <line x1="2" y1="46" x2="118" y2="46" stroke="#e2e8f0"/>
                        <rect x="2" y="46" width="116" height="20" fill="#fff" stroke="#e2e8f0"/>
                        <text x="8" y="60" font-size="10" fill="#334155">nombre VARCHAR</text>
                      </svg>
                    }
                    @case ('view') {
                      <svg viewBox="0 0 120 70" width="56" height="36">
                        <rect x="2" y="2" width="116" height="24" rx="2" fill="#0d9488" stroke="#0f766e"/>
                        <text x="60" y="17" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Vista</text>
                        <line x1="2" y1="26" x2="118" y2="26" stroke="#e2e8f0"/>
                        <rect x="2" y="26" width="116" height="20" fill="#f0fdfa" stroke="#e2e8f0"/>
                        <text x="8" y="40" font-size="10" fill="#334155">SELECT...</text>
                        <line x1="2" y1="46" x2="118" y2="46" stroke="#e2e8f0"/>
                        <rect x="2" y="46" width="116" height="20" fill="#fff" stroke="#e2e8f0"/>
                        <text x="8" y="60" font-size="10" fill="#334155">col1, col2</text>
                      </svg>
                    }
                    @case ('procedure') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="8" fill="#fef3c7" stroke="#f59e0b"/>
                        <text x="50" y="28" text-anchor="middle" fill="#92400e" font-size="9" font-weight="bold">PROC</text>
                        <text x="50" y="42" text-anchor="middle" fill="#b45309" font-size="8">sp_nombre</text>
                      </svg>
                    }
                    @case ('database') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <ellipse cx="50" cy="12" rx="40" ry="8" fill="#6366f1" stroke="#4f46e5"/>
                        <path d="M10 12 v36 q0 4 40 8 q40 -4 40 -8 v-36 q-40 4 -40 8 q-40 -4 -40 -8" fill="#eef2ff" stroke="#6366f1"/>
                        <ellipse cx="50" cy="48" rx="40" ry="8" fill="none" stroke="#6366f1" stroke-width="2"/>
                      </svg>
                    }
                    @case ('schema') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <path d="M5 20 L5 55 L50 55 L95 20 L50 5 Z" fill="#f1f5f9" stroke="#6366f1"/>
                        <path d="M5 20 L50 5 L95 20" fill="none" stroke="#6366f1"/>
                        <text x="50" y="38" text-anchor="middle" fill="#334155" font-size="10" font-weight="bold">Schema</text>
                      </svg>
                    }
                    @case ('trigger') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="6" fill="#fce7f3" stroke="#ec4899"/>
                        <text x="50" y="28" text-anchor="middle" fill="#be185d" font-size="9" font-weight="bold">TRIGGER</text>
                        <text x="50" y="44" text-anchor="middle" fill="#db2777" font-size="8">before_insert</text>
                      </svg>
                    }
                    @default {}
                  }
                </div>
              }
            </div>
          </details>
        }
      </div>
    </aside>
  `,
  styles: []
})
export class ShapesPanelComponent {
  search = signal('');
  categories = [
    { name: 'Flujo', key: 'flow', open: true },
    { name: 'Flechas', key: 'arrows', open: false },
    { name: 'Base de datos', key: 'database', open: true },
  ];

  constructor(private diagram: DiagramService) {}

  getShapesForCategory(key: string): ShapeDef[] {
    const q = this.search().toLowerCase();
    return SHAPE_DEFS.filter(s => {
      if (s.category !== key) return false;
      if (q && !s.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  onDragStart(event: DragEvent, item: ShapeDef): void {
    event.dataTransfer?.setData('application/shape', JSON.stringify({ shape: item.shape, table: item.table }));
  }
}
