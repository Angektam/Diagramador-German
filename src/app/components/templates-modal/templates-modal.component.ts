import { Component, inject, signal } from '@angular/core';
import { DiagramService } from '../../services/diagram.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'flow' | 'database' | 'custom';
  thumbnail: string;
  data: string; // JSON del diagrama
}

const PREDEFINED_TEMPLATES: Template[] = [
  {
    id: 'flow-basic',
    name: 'Flujo básico',
    description: 'Diagrama de flujo simple con inicio, proceso y fin',
    category: 'flow',
    thumbnail: '📊',
    data: JSON.stringify({
      shapes: [
        { id: 's1', type: 'ellipse', x: 300, y: 50, width: 120, height: 60, text: 'Inicio', fill: '#86efac', stroke: '#16a34a' },
        { id: 's2', type: 'rect', x: 300, y: 150, width: 120, height: 60, text: 'Proceso', fill: '#93c5fd', stroke: '#2563eb' },
        { id: 's3', type: 'diamond', x: 280, y: 250, width: 160, height: 80, text: '¿Condición?', fill: '#fde047', stroke: '#ca8a04' },
        { id: 's4', type: 'ellipse', x: 300, y: 380, width: 120, height: 60, text: 'Fin', fill: '#fca5a5', stroke: '#dc2626' }
      ],
      connections: [
        { id: 'c1', fromId: 's1', toId: 's2' },
        { id: 'c2', fromId: 's2', toId: 's3' },
        { id: 'c3', fromId: 's3', toId: 's4' }
      ],
      zoom: 100
    })
  },
  {
    id: 'flow-decision',
    name: 'Flujo con decisiones',
    description: 'Diagrama con múltiples decisiones y caminos',
    category: 'flow',
    thumbnail: '🔀',
    data: JSON.stringify({
      shapes: [
        { id: 's1', type: 'ellipse', x: 350, y: 30, width: 100, height: 50, text: 'Inicio', fill: '#86efac', stroke: '#16a34a' },
        { id: 's2', type: 'diamond', x: 330, y: 120, width: 140, height: 70, text: '¿Válido?', fill: '#fde047', stroke: '#ca8a04' },
        { id: 's3', type: 'rect', x: 150, y: 230, width: 100, height: 50, text: 'Procesar', fill: '#93c5fd', stroke: '#2563eb' },
        { id: 's4', type: 'rect', x: 550, y: 230, width: 100, height: 50, text: 'Rechazar', fill: '#fca5a5', stroke: '#dc2626' },
        { id: 's5', type: 'ellipse', x: 350, y: 330, width: 100, height: 50, text: 'Fin', fill: '#fca5a5', stroke: '#dc2626' }
      ],
      connections: [
        { id: 'c1', fromId: 's1', toId: 's2' },
        { id: 'c2', fromId: 's2', toId: 's3' },
        { id: 'c3', fromId: 's2', toId: 's4' },
        { id: 'c4', fromId: 's3', toId: 's5' },
        { id: 'c5', fromId: 's4', toId: 's5' }
      ],
      zoom: 100
    })
  },
  {
    id: 'db-users',
    name: 'Sistema de usuarios',
    description: 'Esquema básico de usuarios con roles y permisos',
    category: 'database',
    thumbnail: '👥',
    data: JSON.stringify({
      shapes: [
        {
          id: 't1',
          type: 'table',
          x: 50,
          y: 50,
          width: 200,
          height: 180,
          tableData: {
            name: 'usuarios',
            columns: [
              { name: 'id', type: 'INT', pk: true },
              { name: 'username', type: 'VARCHAR(50)' },
              { name: 'email', type: 'VARCHAR(100)' },
              { name: 'password', type: 'VARCHAR(255)' },
              { name: 'rol_id', type: 'INT', fk: 'roles' }
            ]
          }
        },
        {
          id: 't2',
          type: 'table',
          x: 350,
          y: 50,
          width: 200,
          height: 130,
          tableData: {
            name: 'roles',
            columns: [
              { name: 'id', type: 'INT', pk: true },
              { name: 'nombre', type: 'VARCHAR(50)' },
              { name: 'descripcion', type: 'TEXT' }
            ]
          }
        }
      ],
      connections: [
        { id: 'c1', fromId: 't1', toId: 't2' }
      ],
      zoom: 100
    })
  },
  {
    id: 'db-ecommerce',
    name: 'E-commerce básico',
    description: 'Productos, categorías, pedidos y clientes',
    category: 'database',
    thumbnail: '🛒',
    data: JSON.stringify({
      shapes: [
        {
          id: 't1',
          type: 'table',
          x: 50,
          y: 50,
          width: 200,
          height: 155,
          tableData: {
            name: 'productos',
            columns: [
              { name: 'id', type: 'INT', pk: true },
              { name: 'nombre', type: 'VARCHAR(100)' },
              { name: 'precio', type: 'DECIMAL(10,2)' },
              { name: 'categoria_id', type: 'INT', fk: 'categorias' }
            ]
          }
        },
        {
          id: 't2',
          type: 'table',
          x: 350,
          y: 50,
          width: 200,
          height: 130,
          tableData: {
            name: 'categorias',
            columns: [
              { name: 'id', type: 'INT', pk: true },
              { name: 'nombre', type: 'VARCHAR(50)' },
              { name: 'descripcion', type: 'TEXT' }
            ]
          }
        },
        {
          id: 't3',
          type: 'table',
          x: 50,
          y: 280,
          width: 200,
          height: 180,
          tableData: {
            name: 'pedidos',
            columns: [
              { name: 'id', type: 'INT', pk: true },
              { name: 'cliente_id', type: 'INT', fk: 'clientes' },
              { name: 'producto_id', type: 'INT', fk: 'productos' },
              { name: 'cantidad', type: 'INT' },
              { name: 'fecha', type: 'DATETIME' }
            ]
          }
        },
        {
          id: 't4',
          type: 'table',
          x: 350,
          y: 280,
          width: 200,
          height: 155,
          tableData: {
            name: 'clientes',
            columns: [
              { name: 'id', type: 'INT', pk: true },
              { name: 'nombre', type: 'VARCHAR(100)' },
              { name: 'email', type: 'VARCHAR(100)' },
              { name: 'telefono', type: 'VARCHAR(20)' }
            ]
          }
        }
      ],
      connections: [
        { id: 'c1', fromId: 't1', toId: 't2' },
        { id: 'c2', fromId: 't3', toId: 't1' },
        { id: 'c3', fromId: 't3', toId: 't4' }
      ],
      zoom: 100
    })
  }
];

@Component({
  selector: 'app-templates-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (diagram.templatesModalOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content templates-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>📋 Plantillas</h2>
            <button class="close-btn" (click)="close()">✕</button>
          </div>

          <div class="templates-tabs">
            <button 
              class="tab-btn" 
              [class.active]="activeTab() === 'flow'"
              (click)="activeTab.set('flow')">
              📊 Diagramas de flujo
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab() === 'database'"
              (click)="activeTab.set('database')">
              🗄️ Base de datos
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab() === 'custom'"
              (click)="activeTab.set('custom')">
              ⭐ Mis plantillas
            </button>
          </div>

          <div class="templates-grid">
            @for (template of getFilteredTemplates(); track template.id) {
              <div class="template-card" (click)="loadTemplate(template)">
                <div class="template-thumbnail">{{ template.thumbnail }}</div>
                <div class="template-info">
                  <h3>{{ template.name }}</h3>
                  <p>{{ template.description }}</p>
                </div>
                @if (template.category === 'custom') {
                  <button 
                    class="delete-template-btn" 
                    (click)="deleteCustomTemplate($event, template.id)"
                    title="Eliminar plantilla">
                    🗑️
                  </button>
                }
              </div>
            } @empty {
              <div class="empty-state">
                @if (activeTab() === 'custom') {
                  <p>No tienes plantillas personalizadas</p>
                  <small>Guarda un diagrama como plantilla desde el menú Archivo</small>
                } @else {
                  <p>No hay plantillas disponibles</p>
                }
              </div>
            }
          </div>

          @if (activeTab() === 'custom') {
            <div class="modal-footer">
              <button class="btn-secondary" (click)="saveCurrentAsTemplate()">
                💾 Guardar diagrama actual como plantilla
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .templates-modal {
      max-width: 900px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .templates-tabs {
      display: flex;
      gap: 8px;
      padding: 0 24px;
      border-bottom: 1px solid var(--border);
    }

    .tab-btn {
      padding: 12px 20px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-size: 14px;
      color: var(--text-secondary);
      transition: all 0.2s;
    }

    .tab-btn:hover {
      color: var(--text);
      background: var(--hover);
    }

    .tab-btn.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
      font-weight: 600;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .template-card {
      position: relative;
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--bg);
    }

    .template-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .template-thumbnail {
      font-size: 48px;
      text-align: center;
      margin-bottom: 12px;
    }

    .template-info h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--text);
    }

    .template-info p {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .delete-template-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 16px;
      opacity: 0;
      transition: all 0.2s;
    }

    .template-card:hover .delete-template-btn {
      opacity: 1;
    }

    .delete-template-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      transform: scale(1.1);
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }

    .empty-state p {
      font-size: 16px;
      margin: 0 0 8px 0;
    }

    .empty-state small {
      font-size: 13px;
      opacity: 0.7;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: center;
    }

    .btn-secondary {
      padding: 10px 20px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: var(--hover);
      border-color: var(--accent);
    }
  `]
})
export class TemplatesModalComponent {
  diagram = inject(DiagramService);
  notifications = inject(NotificationService);
  
  activeTab = signal<'flow' | 'database' | 'custom'>('flow');
  customTemplates = signal<Template[]>([]);

  constructor() {
    this.loadCustomTemplates();
  }

  close() {
    this.diagram.closeTemplatesModal();
  }

  getFilteredTemplates(): Template[] {
    const tab = this.activeTab();
    if (tab === 'custom') {
      return this.customTemplates();
    }
    return PREDEFINED_TEMPLATES.filter(t => t.category === tab);
  }

  loadTemplate(template: Template) {
    if (confirm(`¿Cargar la plantilla "${template.name}"? Se perderán los cambios no guardados.`)) {
      this.diagram.loadDiagramJson(template.data);
      this.close();
      this.notifications.success(`Plantilla "${template.name}" cargada`);
    }
  }

  saveCurrentAsTemplate() {
    const name = prompt('Nombre de la plantilla:');
    if (!name) return;

    const description = prompt('Descripción (opcional):') || 'Plantilla personalizada';
    
    const currentData = this.diagram.getDiagramJson();
    const newTemplate: Template = {
      id: 'custom-' + Date.now(),
      name,
      description,
      category: 'custom',
      thumbnail: '📝',
      data: currentData
    };

    const customs = this.customTemplates();
    customs.push(newTemplate);
    this.customTemplates.set([...customs]);
    
    localStorage.setItem('custom_templates', JSON.stringify(customs));
    this.notifications.success('Plantilla guardada');
    this.activeTab.set('custom');
  }

  deleteCustomTemplate(event: Event, templateId: string) {
    event.stopPropagation();
    
    if (!confirm('¿Eliminar esta plantilla?')) return;

    const customs = this.customTemplates().filter(t => t.id !== templateId);
    this.customTemplates.set(customs);
    localStorage.setItem('custom_templates', JSON.stringify(customs));
    this.notifications.success('Plantilla eliminada');
  }

  private loadCustomTemplates() {
    try {
      const stored = localStorage.getItem('custom_templates');
      if (stored) {
        this.customTemplates.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading custom templates:', e);
    }
  }
}
