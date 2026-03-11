import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemaGeneratorService, SchemaTemplate } from '../../services/schema-generator.service';
import { DiagramService } from '../../services/diagram.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-schema-templates-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>📚 Plantillas de Esquemas</h2>
          <button class="close-btn" (click)="close.emit()">✕</button>
        </div>

        <div class="modal-body">
          <!-- Category Filter -->
          <div class="category-filter">
            <button 
              *ngFor="let category of categories()"
              [class.active]="selectedCategory() === category"
              (click)="selectedCategory.set(category)"
              class="category-btn">
              {{ category }}
            </button>
          </div>

          <!-- Templates Grid -->
          <div class="templates-grid">
            <div 
              *ngFor="let template of filteredTemplates()"
              class="template-card"
              [class.selected]="selectedTemplate()?.id === template.id"
              (click)="selectTemplate(template)">
              <div class="template-icon">
                {{ getTemplateIcon(template.category) }}
              </div>
              <h3>{{ template.name }}</h3>
              <p class="template-description">{{ template.description }}</p>
              <div class="template-info">
                <span class="badge">{{ template.tables.length }} tablas</span>
                <span class="badge">{{ template.category }}</span>
              </div>
            </div>
          </div>

          <!-- Template Preview -->
          <div *ngIf="selectedTemplate()" class="template-preview">
            <h3>Vista Previa: {{ selectedTemplate()!.name }}</h3>
            <div class="tables-list">
              <div *ngFor="let table of selectedTemplate()!.tables" class="table-item">
                <div class="table-header">
                  <strong>📋 {{ table.name }}</strong>
                  <span class="column-count">{{ table.columns.length }} columnas</span>
                </div>
                <div class="columns-preview">
                  <div *ngFor="let col of table.columns.slice(0, 5)" class="column-preview">
                    <span class="col-name">{{ col.name }}</span>
                    <span class="col-type">{{ col.type }}</span>
                  </div>
                  <div *ngIf="table.columns.length > 5" class="more-columns">
                    +{{ table.columns.length - 5 }} más...
                  </div>
                </div>
                <div *ngIf="table.foreignKeys && table.foreignKeys.length > 0" class="foreign-keys">
                  <small>🔗 {{ table.foreignKeys.length }} relación(es)</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="close.emit()">
            Cancelar
          </button>
          <button 
            class="btn-primary" 
            [disabled]="!selectedTemplate() || loading()"
            (click)="generateSchema()">
            {{ loading() ? '⏳ Generando...' : '✨ Generar Esquema' }}
          </button>
          <button 
            class="btn-secondary" 
            [disabled]="!selectedTemplate()"
            (click)="viewSQL()">
            👁️ Ver SQL
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 1200px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f0f0f0;
      color: #333;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .category-filter {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .category-btn {
      padding: 8px 16px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .category-btn:hover {
      border-color: #2196F3;
      background: #E3F2FD;
    }

    .category-btn.active {
      background: #2196F3;
      color: white;
      border-color: #2196F3;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .template-card {
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
    }

    .template-card:hover {
      border-color: #2196F3;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
      transform: translateY(-2px);
    }

    .template-card.selected {
      border-color: #2196F3;
      background: #E3F2FD;
    }

    .template-icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 12px;
    }

    .template-card h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #333;
    }

    .template-description {
      font-size: 14px;
      color: #666;
      margin: 0 0 12px 0;
      line-height: 1.4;
    }

    .template-info {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      color: #666;
    }

    .template-preview {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }

    .template-preview h3 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .tables-list {
      display: grid;
      gap: 12px;
    }

    .table-item {
      background: white;
      border-radius: 8px;
      padding: 12px;
      border: 1px solid #e0e0e0;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .column-count {
      font-size: 12px;
      color: #666;
    }

    .columns-preview {
      display: grid;
      gap: 4px;
      font-size: 13px;
    }

    .column-preview {
      display: flex;
      justify-content: space-between;
      padding: 4px 8px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .col-name {
      color: #333;
      font-weight: 500;
    }

    .col-type {
      color: #666;
      font-family: monospace;
      font-size: 12px;
    }

    .more-columns {
      padding: 4px 8px;
      color: #666;
      font-style: italic;
      font-size: 12px;
    }

    .foreign-keys {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e0e0e0;
    }

    .foreign-keys small {
      color: #2196F3;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #2196F3;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1976D2;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #666;
      border: 1px solid #e0e0e0;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #f5f5f5;
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class SchemaTemplatesModalComponent {
  close = output<void>();
  
  selectedTemplate = signal<SchemaTemplate | null>(null);
  selectedCategory = signal<string>('Todos');
  loading = signal(false);
  
  categories = signal<string[]>(['Todos']);
  filteredTemplates = signal<SchemaTemplate[]>([]);

  constructor(
    private schemaGenerator: SchemaGeneratorService,
    private diagramService: DiagramService,
    private notificationService: NotificationService
  ) {
    const allCategories = ['Todos', ...this.schemaGenerator.getAllCategories()];
    this.categories.set(allCategories);
    this.updateFilteredTemplates();
  }

  selectTemplate(template: SchemaTemplate) {
    this.selectedTemplate.set(template);
  }

  updateFilteredTemplates() {
    const category = this.selectedCategory();
    if (category === 'Todos') {
      this.filteredTemplates.set(this.schemaGenerator.templates());
    } else {
      this.filteredTemplates.set(
        this.schemaGenerator.getTemplatesByCategory(category)
      );
    }
  }

  getTemplateIcon(category: string): string {
    const icons: Record<string, string> = {
      'Negocios': '🛒',
      'Contenido': '📝',
      'Gastronomía': '🍳',
      'Social': '👥'
    };
    return icons[category] || '📊';
  }

  async generateSchema() {
    const template = this.selectedTemplate();
    if (!template) return;

    this.loading.set(true);
    try {
      // Generate SQL
      const sql = this.schemaGenerator.generateSQL(template);
      
      // Import SQL into diagram
      this.diagramService.loadExternalSql(sql);
      
      this.notificationService.show(
        `✅ Esquema "${template.name}" generado exitosamente`,
        'success'
      );
      
      this.close.emit();
    } catch (error) {
      console.error('Error generating schema:', error);
      this.notificationService.show(
        '❌ Error al generar el esquema',
        'error'
      );
    } finally {
      this.loading.set(false);
    }
  }

  viewSQL() {
    const template = this.selectedTemplate();
    if (!template) return;

    const sql = this.schemaGenerator.generateSQL(template);
    
    // Create a modal or download the SQL
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id}_schema.sql`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.notificationService.show(
      '📥 SQL descargado exitosamente',
      'success'
    );
  }
}
