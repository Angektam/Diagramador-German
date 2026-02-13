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
  { shape: 'index', title: 'Índice', category: 'database' },
  { shape: 'function', title: 'Función', category: 'database' },
  { shape: 'constraint', title: 'Restricción', category: 'database' },
  { shape: 'sequence', title: 'Secuencia', category: 'database' },
  { shape: 'partition', title: 'Partición', category: 'database' },
  { shape: 'materialized-view', title: 'Vista materializada', category: 'database' },
  { shape: 'synonym', title: 'Sinónimo', category: 'database' },
  { shape: 'package', title: 'Paquete DB', category: 'database' },
  { shape: 'cursor', title: 'Cursor', category: 'database' },
  
  // Entity Relation (ER)
  { shape: 'er-entity', title: 'Entidad', category: 'er' },
  { shape: 'er-weak-entity', title: 'Entidad débil', category: 'er' },
  { shape: 'er-attribute', title: 'Atributo', category: 'er' },
  { shape: 'er-key-attribute', title: 'Atributo clave', category: 'er' },
  { shape: 'er-multivalued', title: 'Atributo multivaluado', category: 'er' },
  { shape: 'er-derived', title: 'Atributo derivado', category: 'er' },
  { shape: 'er-relationship', title: 'Relación', category: 'er' },
  { shape: 'er-weak-relationship', title: 'Relación débil', category: 'er' },
  { shape: 'er-isa', title: 'Es-un (ISA)', category: 'er' },
  
  // UML
  { shape: 'uml-class', title: 'Clase', category: 'uml' },
  { shape: 'uml-interface', title: 'Interfaz', category: 'uml' },
  { shape: 'uml-abstract', title: 'Clase abstracta', category: 'uml' },
  { shape: 'uml-package', title: 'Paquete', category: 'uml' },
  { shape: 'uml-component', title: 'Componente', category: 'uml' },
  { shape: 'uml-actor', title: 'Actor', category: 'uml' },
  { shape: 'uml-usecase', title: 'Caso de uso', category: 'uml' },
  { shape: 'uml-note', title: 'Nota UML', category: 'uml' },
  { shape: 'uml-state', title: 'Estado', category: 'uml' },
  { shape: 'uml-activity', title: 'Actividad', category: 'uml' },
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
                    @case ('index') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="4" fill="#ddd6fe" stroke="#7c3aed"/>
                        <text x="50" y="28" text-anchor="middle" fill="#5b21b6" font-size="9" font-weight="bold">INDEX</text>
                        <text x="50" y="44" text-anchor="middle" fill="#6d28d9" font-size="8">idx_name</text>
                      </svg>
                    }
                    @case ('function') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="8" fill="#ccfbf1" stroke="#14b8a6"/>
                        <text x="50" y="28" text-anchor="middle" fill="#0f766e" font-size="9" font-weight="bold">FUNCTION</text>
                        <text x="50" y="44" text-anchor="middle" fill="#0d9488" font-size="8">fn_name()</text>
                      </svg>
                    }
                    @case ('constraint') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="4" fill="#fed7aa" stroke="#ea580c"/>
                        <text x="50" y="28" text-anchor="middle" fill="#9a3412" font-size="9" font-weight="bold">CONSTRAINT</text>
                        <text x="50" y="44" text-anchor="middle" fill="#c2410c" font-size="8">FK / CHECK</text>
                      </svg>
                    }
                    @case ('sequence') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="4" fill="#e0f2fe" stroke="#0284c7"/>
                        <text x="50" y="28" text-anchor="middle" fill="#075985" font-size="9" font-weight="bold">SEQUENCE</text>
                        <text x="50" y="44" text-anchor="middle" fill="#0369a1" font-size="8">seq_id</text>
                      </svg>
                    }
                    @case ('partition') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="4" fill="#fef3c7" stroke="#d97706"/>
                        <line x1="35" y1="5" x2="35" y2="55" stroke="#d97706" stroke-width="1"/>
                        <line x1="65" y1="5" x2="65" y2="55" stroke="#d97706" stroke-width="1"/>
                        <text x="50" y="33" text-anchor="middle" fill="#92400e" font-size="9" font-weight="bold">PARTITION</text>
                      </svg>
                    }
                    @case ('materialized-view') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="4" fill="#d1fae5" stroke="#059669"/>
                        <text x="50" y="25" text-anchor="middle" fill="#065f46" font-size="8" font-weight="bold">MATERIALIZED</text>
                        <text x="50" y="40" text-anchor="middle" fill="#047857" font-size="8" font-weight="bold">VIEW</text>
                      </svg>
                    }
                    @case ('synonym') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="4" fill="#fce7f3" stroke="#db2777"/>
                        <text x="50" y="28" text-anchor="middle" fill="#9f1239" font-size="9" font-weight="bold">SYNONYM</text>
                        <text x="50" y="44" text-anchor="middle" fill="#be185d" font-size="8">alias</text>
                      </svg>
                    }
                    @case ('package') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="4" fill="#e0e7ff" stroke="#4f46e5"/>
                        <text x="50" y="28" text-anchor="middle" fill="#3730a3" font-size="9" font-weight="bold">PACKAGE</text>
                        <text x="50" y="44" text-anchor="middle" fill="#4338ca" font-size="8">pkg_name</text>
                      </svg>
                    }
                    @case ('cursor') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="4" fill="#fef9c3" stroke="#ca8a04"/>
                        <text x="50" y="28" text-anchor="middle" fill="#713f12" font-size="9" font-weight="bold">CURSOR</text>
                        <text x="50" y="44" text-anchor="middle" fill="#854d0e" font-size="8">cur_name</text>
                      </svg>
                    }
                    @case ('er-entity') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
                        <text x="50" y="33" text-anchor="middle" fill="#1e40af" font-size="11" font-weight="bold">Entidad</text>
                      </svg>
                    }
                    @case ('er-weak-entity') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="5" width="90" height="50" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
                        <rect x="10" y="10" width="80" height="40" rx="4" fill="none" stroke="#2563eb" stroke-width="2"/>
                        <text x="50" y="33" text-anchor="middle" fill="#1e40af" font-size="10" font-weight="bold">Débil</text>
                      </svg>
                    }
                    @case ('er-attribute') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <ellipse cx="50" cy="30" rx="45" ry="25" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
                        <text x="50" y="33" text-anchor="middle" fill="#92400e" font-size="10">atributo</text>
                      </svg>
                    }
                    @case ('er-key-attribute') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <ellipse cx="50" cy="30" rx="45" ry="25" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
                        <text x="50" y="33" text-anchor="middle" fill="#92400e" font-size="10" font-weight="bold" text-decoration="underline">clave</text>
                      </svg>
                    }
                    @case ('er-multivalued') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <ellipse cx="50" cy="30" rx="45" ry="25" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
                        <ellipse cx="50" cy="30" rx="40" ry="20" fill="none" stroke="#f59e0b" stroke-width="2"/>
                        <text x="50" y="33" text-anchor="middle" fill="#92400e" font-size="9">multi</text>
                      </svg>
                    }
                    @case ('er-derived') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <ellipse cx="50" cy="30" rx="45" ry="25" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,3"/>
                        <text x="50" y="33" text-anchor="middle" fill="#92400e" font-size="10">derivado</text>
                      </svg>
                    }
                    @case ('er-relationship') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <polygon points="50,5 95,30 50,55 5,30" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
                        <text x="50" y="33" text-anchor="middle" fill="#15803d" font-size="10">relación</text>
                      </svg>
                    }
                    @case ('er-weak-relationship') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <polygon points="50,5 95,30 50,55 5,30" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
                        <polygon points="50,10 90,30 50,50 10,30" fill="none" stroke="#16a34a" stroke-width="2"/>
                        <text x="50" y="33" text-anchor="middle" fill="#15803d" font-size="9">débil</text>
                      </svg>
                    }
                    @case ('er-isa') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <polygon points="50,5 95,55 5,55" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
                        <text x="50" y="40" text-anchor="middle" fill="#4338ca" font-size="11" font-weight="bold">ISA</text>
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
                    @case ('uml-class') {
                      <svg viewBox="0 0 120 90" width="56" height="42">
                        <rect x="2" y="2" width="116" height="86" rx="2" fill="#fff" stroke="#333" stroke-width="2"/>
                        <line x1="2" y1="30" x2="118" y2="30" stroke="#333" stroke-width="2"/>
                        <line x1="2" y1="58" x2="118" y2="58" stroke="#333" stroke-width="2"/>
                        <rect x="40" y="10" width="40" height="12" fill="#e5e7eb"/>
                        <rect x="10" y="38" width="50" height="8" fill="#f3f4f6"/>
                        <rect x="10" y="66" width="45" height="8" fill="#f3f4f6"/>
                      </svg>
                    }
                    @case ('uml-interface') {
                      <svg viewBox="0 0 120 90" width="56" height="42">
                        <rect x="2" y="2" width="116" height="86" rx="2" fill="#f0f9ff" stroke="#0284c7" stroke-width="2"/>
                        <circle cx="60" cy="18" r="8" fill="none" stroke="#0284c7" stroke-width="2"/>
                        <line x1="2" y1="35" x2="118" y2="35" stroke="#0284c7" stroke-width="2"/>
                        <rect x="10" y="45" width="50" height="8" fill="#bfdbfe"/>
                        <rect x="10" y="60" width="45" height="8" fill="#bfdbfe"/>
                      </svg>
                    }
                    @case ('uml-abstract') {
                      <svg viewBox="0 0 120 90" width="56" height="42">
                        <rect x="2" y="2" width="116" height="86" rx="2" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
                        <line x1="2" y1="30" x2="118" y2="30" stroke="#f59e0b" stroke-width="2"/>
                        <line x1="2" y1="58" x2="118" y2="58" stroke="#f59e0b" stroke-width="2"/>
                        <rect x="35" y="10" width="50" height="12" fill="#fde68a"/>
                        <rect x="10" y="38" width="50" height="8" fill="#fef3c7"/>
                        <rect x="10" y="66" width="55" height="8" fill="#fef3c7"/>
                      </svg>
                    }
                    @case ('uml-package') {
                      <svg viewBox="0 0 120 80" width="56" height="38">
                        <path d="M2,20 L2,78 L118,78 L118,20 L80,20 L80,2 L2,2 Z" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>
                        <rect x="40" y="40" width="40" height="10" fill="#cbd5e1"/>
                      </svg>
                    }
                    @case ('uml-component') {
                      <svg viewBox="0 0 120 80" width="56" height="38">
                        <rect x="10" y="10" width="100" height="60" rx="4" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
                        <rect x="2" y="20" width="12" height="10" rx="2" fill="#3b82f6"/>
                        <rect x="2" y="50" width="12" height="10" rx="2" fill="#3b82f6"/>
                        <rect x="40" y="35" width="40" height="10" fill="#93c5fd"/>
                      </svg>
                    }
                    @case ('uml-actor') {
                      <svg viewBox="0 0 60 100" width="28" height="48">
                        <circle cx="30" cy="15" r="10" fill="none" stroke="#333" stroke-width="2"/>
                        <line x1="30" y1="25" x2="30" y2="55" stroke="#333" stroke-width="2"/>
                        <line x1="10" y1="40" x2="50" y2="40" stroke="#333" stroke-width="2"/>
                        <line x1="30" y1="55" x2="15" y2="85" stroke="#333" stroke-width="2"/>
                        <line x1="30" y1="55" x2="45" y2="85" stroke="#333" stroke-width="2"/>
                      </svg>
                    }
                    @case ('uml-usecase') {
                      <svg viewBox="0 0 120 70" width="56" height="34">
                        <ellipse cx="60" cy="35" rx="55" ry="30" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
                        <rect x="35" y="30" width="50" height="10" fill="#fde68a"/>
                      </svg>
                    }
                    @case ('uml-note') {
                      <svg viewBox="0 0 100 80" width="48" height="38">
                        <path d="M5,5 L95,5 L95,60 L80,75 L5,75 Z M80,60 L80,75 L95,60 Z" fill="#fef9c3" stroke="#ca8a04" stroke-width="2"/>
                        <line x1="15" y1="25" x2="75" y2="25" stroke="#ca8a04" stroke-width="1"/>
                        <line x1="15" y1="35" x2="70" y2="35" stroke="#ca8a04" stroke-width="1"/>
                        <line x1="15" y1="45" x2="65" y2="45" stroke="#ca8a04" stroke-width="1"/>
                      </svg>
                    }
                    @case ('uml-state') {
                      <svg viewBox="0 0 120 60" width="56" height="28">
                        <rect x="5" y="5" width="110" height="50" rx="25" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
                        <rect x="40" y="25" width="40" height="10" fill="#c7d2fe"/>
                      </svg>
                    }
                    @case ('uml-activity') {
                      <svg viewBox="0 0 120 60" width="56" height="28">
                        <rect x="5" y="5" width="110" height="50" rx="15" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
                        <rect x="40" y="25" width="40" height="10" fill="#bbf7d0"/>
                      </svg>
                    }
                    @case ('server') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <rect x="10" y="10" width="80" height="25" rx="3" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
                        <circle cx="20" cy="22" r="3" fill="#6366f1"/>
                        <circle cx="30" cy="22" r="3" fill="#10b981"/>
                        <rect x="10" y="40" width="80" height="25" rx="3" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
                        <circle cx="20" cy="52" r="3" fill="#6366f1"/>
                        <circle cx="30" cy="52" r="3" fill="#10b981"/>
                        <rect x="10" y="70" width="80" height="25" rx="3" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
                        <circle cx="20" cy="82" r="3" fill="#6366f1"/>
                        <circle cx="30" cy="82" r="3" fill="#10b981"/>
                      </svg>
                    }
                    @case ('laptop') {
                      <svg viewBox="0 0 100 80" width="48" height="38">
                        <rect x="15" y="10" width="70" height="50" rx="3" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
                        <rect x="10" y="60" width="80" height="8" rx="2" fill="#3b82f6"/>
                        <rect x="20" y="20" width="60" height="35" fill="#1e40af"/>
                      </svg>
                    }
                    @case ('desktop') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <rect x="10" y="10" width="80" height="55" rx="3" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
                        <rect x="15" y="15" width="70" height="45" fill="#1e40af"/>
                        <rect x="40" y="65" width="20" height="15" fill="#3b82f6"/>
                        <rect x="20" y="80" width="60" height="5" rx="2" fill="#3b82f6"/>
                      </svg>
                    }
                    @case ('mobile') {
                      <svg viewBox="0 0 60 100" width="28" height="48">
                        <rect x="10" y="5" width="40" height="90" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
                        <rect x="15" y="12" width="30" height="68" fill="#1e40af"/>
                        <circle cx="30" cy="87" r="4" fill="#3b82f6"/>
                      </svg>
                    }
                    @case ('tablet') {
                      <svg viewBox="0 0 100 80" width="48" height="38">
                        <rect x="10" y="5" width="80" height="70" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
                        <rect x="15" y="10" width="70" height="55" fill="#1e40af"/>
                        <circle cx="50" cy="70" r="3" fill="#3b82f6"/>
                      </svg>
                    }
                    @case ('router') {
                      <svg viewBox="0 0 100 80" width="48" height="38">
                        <rect x="10" y="30" width="80" height="40" rx="4" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
                        <circle cx="25" cy="50" r="4" fill="#16a34a"/>
                        <circle cx="45" cy="50" r="4" fill="#16a34a"/>
                        <circle cx="65" cy="50" r="4" fill="#16a34a"/>
                        <line x1="30" y1="10" x2="30" y2="30" stroke="#16a34a" stroke-width="2"/>
                        <line x1="50" y1="10" x2="50" y2="30" stroke="#16a34a" stroke-width="2"/>
                        <line x1="70" y1="10" x2="70" y2="30" stroke="#16a34a" stroke-width="2"/>
                        <circle cx="30" cy="10" r="3" fill="#16a34a"/>
                        <circle cx="50" cy="10" r="3" fill="#16a34a"/>
                        <circle cx="70" cy="10" r="3" fill="#16a34a"/>
                      </svg>
                    }
                    @case ('switch') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <rect x="5" y="15" width="90" height="35" rx="3" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
                        <circle cx="15" cy="32" r="3" fill="#16a34a"/>
                        <circle cx="28" cy="32" r="3" fill="#16a34a"/>
                        <circle cx="41" cy="32" r="3" fill="#16a34a"/>
                        <circle cx="54" cy="32" r="3" fill="#16a34a"/>
                        <circle cx="67" cy="32" r="3" fill="#16a34a"/>
                        <circle cx="80" cy="32" r="3" fill="#16a34a"/>
                      </svg>
                    }
                    @case ('firewall') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <rect x="10" y="10" width="80" height="80" rx="4" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
                        <path d="M50,25 L65,35 L65,60 Q65,70 50,75 Q35,70 35,60 L35,35 Z" fill="#dc2626"/>
                        <text x="50" y="55" text-anchor="middle" fill="#fff" font-size="20" font-weight="bold">🔥</text>
                      </svg>
                    }
                    @case ('cloud-network') {
                      <svg viewBox="0 0 100 60" width="48" height="28">
                        <path d="M25,35 Q25,20 35,15 Q40,10 50,15 Q60,10 70,15 Q80,20 80,30 Q90,30 90,40 Q90,50 75,50 L25,50 Q10,50 10,40 Q10,30 25,35 Z" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
                        <circle cx="35" cy="35" r="3" fill="#3b82f6"/>
                        <circle cx="50" cy="30" r="3" fill="#3b82f6"/>
                        <circle cx="65" cy="35" r="3" fill="#3b82f6"/>
                      </svg>
                    }
                    @case ('storage') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <rect x="10" y="10" width="80" height="80" rx="4" fill="#f3e8ff" stroke="#9333ea" stroke-width="2"/>
                        <ellipse cx="50" cy="30" rx="30" ry="8" fill="#9333ea"/>
                        <rect x="20" y="30" width="60" height="30" fill="#f3e8ff"/>
                        <line x1="20" y1="30" x2="20" y2="60" stroke="#9333ea" stroke-width="2"/>
                        <line x1="80" y1="30" x2="80" y2="60" stroke="#9333ea" stroke-width="2"/>
                        <ellipse cx="50" cy="60" rx="30" ry="8" fill="none" stroke="#9333ea" stroke-width="2"/>
                      </svg>
                    }
                    @case ('printer') {
                      <svg viewBox="0 0 100 100" width="28" height="28">
                        <rect x="20" y="10" width="60" height="15" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
                        <rect x="10" y="25" width="80" height="40" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                        <rect x="25" y="50" width="50" height="35" fill="#fff" stroke="#475569" stroke-width="2"/>
                        <circle cx="75" cy="35" r="4" fill="#16a34a"/>
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
    { name: 'Entity Relation', key: 'er', open: false },
    { name: 'UML', key: 'uml', open: false },
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
