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
  // Formas de flujo básicas
  { shape: 'rect', title: 'Rectángulo', category: 'flow' },
  { shape: 'rounded', title: 'Rectángulo redondeado', category: 'flow' },
  { shape: 'square', title: 'Cuadrado', category: 'flow' },
  { shape: 'circle', title: 'Círculo', category: 'flow' },
  { shape: 'ellipse', title: 'Elipse (Inicio/Fin)', category: 'flow' },
  { shape: 'diamond', title: 'Rombo (Decisión)', category: 'flow' },
  { shape: 'parallelogram', title: 'Paralelogramo (Entrada/Salida)', category: 'flow' },
  { shape: 'hexagon', title: 'Hexágono (Preparación)', category: 'flow' },
  { shape: 'triangle', title: 'Triángulo', category: 'flow' },
  { shape: 'trapezoid', title: 'Trapecio', category: 'flow' },
  { shape: 'pentagon', title: 'Pentágono', category: 'flow' },
  { shape: 'octagon', title: 'Octágono', category: 'flow' },
  { shape: 'star', title: 'Estrella', category: 'flow' },
  { shape: 'cross', title: 'Cruz', category: 'flow' },
  { shape: 'plus', title: 'Más', category: 'flow' },
  
  // Formas especiales
  { shape: 'cylinder', title: 'Cilindro (Almacenamiento)', category: 'flow' },
  { shape: 'document', title: 'Documento', category: 'flow' },
  { shape: 'multi-document', title: 'Múltiples documentos', category: 'flow' },
  { shape: 'cloud', title: 'Nube', category: 'flow' },
  { shape: 'callout', title: 'Llamada/Comentario', category: 'flow' },
  { shape: 'note', title: 'Nota', category: 'flow' },
  { shape: 'card', title: 'Tarjeta', category: 'flow' },
  { shape: 'tape', title: 'Cinta', category: 'flow' },
  { shape: 'display', title: 'Pantalla', category: 'flow' },
  { shape: 'manual-input', title: 'Entrada manual', category: 'flow' },
  { shape: 'manual-operation', title: 'Operación manual', category: 'flow' },
  { shape: 'delay', title: 'Retraso', category: 'flow' },
  { shape: 'stored-data', title: 'Datos almacenados', category: 'flow' },
  { shape: 'internal-storage', title: 'Almacenamiento interno', category: 'flow' },
  { shape: 'sequential-data', title: 'Datos secuenciales', category: 'flow' },
  { shape: 'direct-data', title: 'Datos directos', category: 'flow' },
  { shape: 'summing-junction', title: 'Unión sumadora', category: 'flow' },
  { shape: 'or', title: 'OR lógico', category: 'flow' },
  { shape: 'collate', title: 'Intercalar', category: 'flow' },
  { shape: 'sort', title: 'Ordenar', category: 'flow' },
  { shape: 'extract', title: 'Extraer', category: 'flow' },
  { shape: 'merge', title: 'Combinar', category: 'flow' },
  { shape: 'off-page', title: 'Conector fuera de página', category: 'flow' },
  { shape: 'on-page', title: 'Conector en página', category: 'flow' },
  
  // Flechas
  { shape: 'arrow-right', title: 'Flecha derecha', category: 'flow' },
  { shape: 'arrow-left', title: 'Flecha izquierda', category: 'flow' },
  { shape: 'arrow-up', title: 'Flecha arriba', category: 'flow' },
  { shape: 'arrow-down', title: 'Flecha abajo', category: 'flow' },
  { shape: 'chevron-right', title: 'Chevron derecha', category: 'flow' },
  { shape: 'chevron-left', title: 'Chevron izquierda', category: 'flow' },
  
  // Formas de base de datos
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
      
      <!-- Scratchpad Area -->
      <div class="scratchpad-section">
        <details open>
          <summary>
            <span class="scratchpad-icon">📋</span>
            <span>Scratchpad</span>
          </summary>
          <div class="scratchpad-area" 
               (drop)="onScratchpadDrop($event)" 
               (dragover)="onScratchpadDragOver($event)">
            @if (scratchpadShapes().length === 0) {
              <div class="scratchpad-empty">
                <span class="drag-hint">Arrastra elementos aquí</span>
              </div>
            } @else {
              <div class="scratchpad-items">
                @for (shape of scratchpadShapes(); track shape.id) {
                  <div class="scratchpad-item" 
                       draggable="true"
                       (dragstart)="onScratchpadItemDragStart($event, shape)"
                       [title]="shape.title">
                    <button class="remove-scratchpad-item" 
                            (click)="removeScratchpadItem(shape.id)"
                            title="Eliminar">×</button>
                    <div class="scratchpad-item-preview">
                      {{ shape.icon }}
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </details>
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
                    @case ('trapezoid') {
                      <svg viewBox="0 0 100 60" width="48" height="28"><polygon points="15,5 85,5 95,55 5,55" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('triangle') {
                      <svg viewBox="0 0 100 60" width="48" height="28"><polygon points="50,5 95,55 5,55" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('pentagon') {
                      <svg viewBox="0 0 100 60" width="48" height="28"><polygon points="50,5 95,25 75,55 25,55 5,25" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('star') {
                      <svg viewBox="0 0 100 60" width="48" height="28"><polygon points="50,5 60,25 82,25 65,38 72,58 50,45 28,58 35,38 18,25 40,25" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('cylinder') {
                      <svg viewBox="0 0 100 70" width="48" height="34">
                        <ellipse cx="50" cy="12" rx="40" ry="8" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                        <rect x="10" y="12" width="80" height="46" fill="var(--shape-fill)" stroke="none"/>
                        <line x1="10" y1="12" x2="10" y2="58" stroke="var(--shape-stroke)" stroke-width="2"/>
                        <line x1="90" y1="12" x2="90" y2="58" stroke="var(--shape-stroke)" stroke-width="2"/>
                        <ellipse cx="50" cy="58" rx="40" ry="8" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('document') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <path d="M5,5 L95,5 L95,50 Q75,55 50,50 Q25,45 5,50 Z" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('cloud') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <path d="M25,35 Q25,20 35,15 Q40,10 50,15 Q60,10 70,15 Q80,20 80,30 Q90,30 90,40 Q90,50 75,50 L25,50 Q10,50 10,40 Q10,30 25,35 Z" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('arrow-right') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <polygon points="5,20 70,20 70,5 95,30 70,55 70,40 5,40" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('arrow-left') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <polygon points="95,20 30,20 30,5 5,30 30,55 30,40 95,40" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('square') {
                      <svg viewBox="0 0 60 60" width="28" height="28"><rect x="5" y="5" width="50" height="50" rx="4" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('circle') {
                      <svg viewBox="0 0 60 60" width="28" height="28"><circle cx="30" cy="30" r="25" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('octagon') {
                      <svg viewBox="0 0 100 100" width="28" height="28"><polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('cross') {
                      <svg viewBox="0 0 100 100" width="28" height="28"><polygon points="35,5 65,5 65,35 95,35 95,65 65,65 65,95 35,95 35,65 5,65 5,35 35,35" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('plus') {
                      <svg viewBox="0 0 100 100" width="28" height="28"><path d="M40,5 L60,5 L60,40 L95,40 L95,60 L60,60 L60,95 L40,95 L40,60 L5,60 L5,40 L40,40 Z" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/></svg>
                    }
                    @case ('multi-document') {
                      <svg viewBox="0 0 100 70" width="48" height="34">
                        <path d="M10,10 L85,10 L85,45 Q65,50 45,45 Q25,40 10,45 Z" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                        <path d="M5,5 L80,5 L80,40 Q60,45 40,40 Q20,35 5,40 Z" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('callout') {
                      <svg viewBox="0 0 100 70" width="48" height="34">
                        <path d="M5,5 L95,5 L95,50 L30,50 L20,65 L25,50 L5,50 Z" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('note') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <path d="M5,5 L95,5 L95,75 L75,95 L5,95 Z M75,75 L75,95 L95,75 Z" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('card') {
                      <svg viewBox="0 0 100 70" width="48" height="34">
                        <rect x="5" y="5" width="90" height="60" rx="6" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                        <line x1="5" y1="20" x2="95" y2="20" stroke="var(--shape-stroke)" stroke-width="2"/>
                      </svg>
                    }
                    @case ('tape') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <path d="M5,30 Q5,10 25,10 L75,10 Q95,10 95,30 Q95,50 75,50 L25,50 Q5,50 5,30" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('display') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <path d="M10,5 L90,5 Q95,30 90,55 L10,55 Q5,30 10,5" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('manual-input') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <polygon points="5,15 95,5 95,55 5,55" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('manual-operation') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <polygon points="15,5 85,5 95,55 5,55" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('delay') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <path d="M5,5 L75,5 Q95,30 75,55 L5,55 Z" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('stored-data') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <path d="M15,5 Q5,30 15,55 L95,55 Q85,30 95,5 Z" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('internal-storage') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <rect x="5" y="5" width="90" height="90" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                        <line x1="25" y1="5" x2="25" y2="95" stroke="var(--shape-stroke)" stroke-width="2"/>
                        <line x1="5" y1="25" x2="95" y2="25" stroke="var(--shape-stroke)" stroke-width="2"/>
                      </svg>
                    }
                    @case ('sequential-data') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <ellipse cx="50" cy="30" rx="45" ry="25" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('direct-data') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <path d="M15,5 L95,5 L85,55 L5,55 Z" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('summing-junction') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <circle cx="50" cy="50" r="40" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                        <line x1="15" y1="50" x2="85" y2="50" stroke="var(--shape-stroke)" stroke-width="2"/>
                        <line x1="50" y1="15" x2="50" y2="85" stroke="var(--shape-stroke)" stroke-width="2"/>
                      </svg>
                    }
                    @case ('or') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <circle cx="50" cy="50" r="40" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                        <line x1="15" y1="50" x2="85" y2="50" stroke="var(--shape-stroke)" stroke-width="2"/>
                      </svg>
                    }
                    @case ('collate') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <polygon points="50,10 90,90 10,90" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                        <polygon points="50,90 10,10 90,10" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('sort') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <polygon points="50,10 90,50 10,50" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                        <polygon points="50,90 10,50 90,50" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('extract') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <polygon points="50,10 90,90 10,90" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('merge') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <polygon points="50,90 10,10 90,10" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('off-page') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <polygon points="5,5 95,5 95,70 50,95 5,70" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('on-page') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <circle cx="50" cy="50" r="40" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('arrow-up') {
                      <svg viewBox="0 0 60 100" width="28" height="48">
                        <polygon points="20,95 20,30 5,30 30,5 55,30 40,30 40,95" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('arrow-down') {
                      <svg viewBox="0 0 60 100" width="28" height="48">
                        <polygon points="20,5 20,70 5,70 30,95 55,70 40,70 40,5" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('chevron-right') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <polygon points="5,5 70,5 95,30 70,55 5,55 30,30" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
                      </svg>
                    }
                    @case ('chevron-left') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <polygon points="95,5 30,5 5,30 30,55 95,55 70,30" fill="var(--shape-fill)" stroke="var(--shape-stroke)"/>
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
  scratchpadShapes = signal<Array<{id: string, shape: string, title: string, icon: string, table?: boolean}>>([]);
  
  categories = [
    { name: 'Flujo', key: 'flow', open: true },
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
  
  // Scratchpad methods
  onScratchpadDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onScratchpadDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const data = event.dataTransfer?.getData('application/shape');
    if (!data) return;
    
    const { shape, table } = JSON.parse(data);
    const shapeDef = SHAPE_DEFS.find(s => s.shape === shape);
    if (!shapeDef) return;
    
    // Check if already in scratchpad
    if (this.scratchpadShapes().some(s => s.shape === shape)) {
      return;
    }
    
    // Add to scratchpad
    const newItem = {
      id: `scratch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      shape: shape,
      title: shapeDef.title,
      icon: this.getShapeIcon(shape),
      table: table
    };
    
    this.scratchpadShapes.update(items => [...items, newItem]);
  }
  
  onScratchpadItemDragStart(event: DragEvent, item: any): void {
    event.dataTransfer?.setData('application/shape', JSON.stringify({ shape: item.shape, table: item.table }));
  }
  
  removeScratchpadItem(id: string): void {
    this.scratchpadShapes.update(items => items.filter(item => item.id !== id));
  }
  
  getShapeIcon(shape: string): string {
    const icons: Record<string, string> = {
      'rect': '▭',
      'rounded': '▢',
      'diamond': '◆',
      'ellipse': '⬭',
      'circle': '●',
      'square': '■',
      'triangle': '▲',
      'hexagon': '⬡',
      'star': '★',
      'table': '📊',
      'database': '🗄️',
      'procedure': '⚙️',
      'view': '👁️',
      'arrow-right': '→',
      'arrow-left': '←',
      'arrow-up': '↑',
      'arrow-down': '↓',
      'cloud': '☁️',
      'document': '📄',
    };
    return icons[shape] || '▭';
  }
}
