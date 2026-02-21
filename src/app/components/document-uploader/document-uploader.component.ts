import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentProcessorService, ProcessedDocument } from '../../services/document-processor.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-document-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="onOverlayClick($event)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>📄 Cargar Documento</h2>
            <button class="close-btn" (click)="close()">×</button>
          </div>

          <div class="modal-body">
            @if (!processedDoc()) {
              <!-- Área de carga -->
              <div class="upload-area" 
                   [class.drag-over]="isDragOver()"
                   (dragover)="onDragOver($event)"
                   (dragleave)="onDragLeave($event)"
                   (drop)="onDrop($event)"
                   (click)="fileInput.click()">
                <div class="upload-icon">📁</div>
                <p class="upload-text">Arrastra un archivo aquí o haz clic para seleccionar</p>
                <p class="upload-hint">Formatos: .txt, .md, .doc, .docx, .pdf</p>
                <input #fileInput
                       type="file"
                       accept=".txt,.md,.doc,.docx,.pdf"
                       (change)="onFileSelected($event)"
                       style="display: none">
              </div>

              <!-- Área de texto manual -->
              <div class="text-input-section">
                <h3>O pega el contenido aquí:</h3>
                <textarea 
                  [(ngModel)]="manualText"
                  placeholder="Pega aquí el contenido de tu entrevista, proceso de producción, requisitos, etc.&#10;&#10;Ejemplo:&#10;Entrevista con el cliente:&#10;P: ¿Qué información necesitas almacenar?&#10;R: Necesitamos gestionar clientes, productos y ventas...&#10;&#10;Proceso de producción:&#10;1. Recepción de materia prima&#10;2. Control de calidad&#10;3. Procesamiento..."
                  class="text-area"
                  rows="10"></textarea>
                <button class="btn-primary" 
                        (click)="processManualText()"
                        [disabled]="!manualText.trim()">
                  Procesar Texto
                </button>
              </div>
            } @else {
              <!-- Vista previa del documento procesado -->
              <div class="preview-section">
                <h3>📊 Análisis del Documento</h3>
                
                <div class="info-card">
                  <div class="info-label">Tipo de documento:</div>
                  <div class="info-value">{{ getDocumentTypeLabel() }}</div>
                </div>

                @if (processedDoc()!.entities.length > 0) {
                  <div class="info-card">
                    <div class="info-label">Entidades detectadas ({{ processedDoc()!.entities.length }}):</div>
                    <div class="entities-list">
                      @for (entity of processedDoc()!.entities; track entity) {
                        <span class="entity-tag">{{ entity }}</span>
                      }
                    </div>
                  </div>
                }

                @if (processedDoc()!.relationships.length > 0) {
                  <div class="info-card">
                    <div class="info-label">Relaciones detectadas ({{ processedDoc()!.relationships.length }}):</div>
                    <div class="relationships-list">
                      @for (rel of processedDoc()!.relationships.slice(0, 5); track $index) {
                        <div class="relationship-item">
                          {{ rel.from }} → {{ rel.to }} ({{ rel.type }})
                        </div>
                      }
                      @if (processedDoc()!.relationships.length > 5) {
                        <div class="more-items">
                          +{{ processedDoc()!.relationships.length - 5 }} más...
                        </div>
                      }
                    </div>
                  </div>
                }

                @if (processedDoc()!.processes.length > 0) {
                  <div class="info-card">
                    <div class="info-label">Procesos detectados ({{ processedDoc()!.processes.length }}):</div>
                    <div class="processes-list">
                      @for (proc of processedDoc()!.processes; track proc.name) {
                        <div class="process-item">
                          <strong>{{ proc.name }}</strong>
                          <div class="process-steps">
                            @for (step of proc.steps.slice(0, 3); track $index) {
                              <div class="step-item">{{ $index + 1 }}. {{ step }}</div>
                            }
                            @if (proc.steps.length > 3) {
                              <div class="more-items">+{{ proc.steps.length - 3 }} pasos más...</div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <div class="preview-actions">
                  <button class="btn-secondary" (click)="reset()">
                    ← Cargar Otro
                  </button>
                  <button class="btn-primary" (click)="generateDiagram()">
                    ✨ Generar Diagrama
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    .modal {
      width: 700px;
      max-width: 90vw;
      max-height: 85vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      color: #333;
    }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 28px;
      color: #999;
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f1f3f5;
      color: #333;
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .upload-area {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background: #f8fafc;
      margin-bottom: 30px;
    }

    .upload-area:hover {
      border-color: #667eea;
      background: #eef2ff;
    }

    .upload-area.drag-over {
      border-color: #667eea;
      background: #eef2ff;
      transform: scale(1.02);
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .upload-text {
      font-size: 16px;
      color: #333;
      margin-bottom: 8px;
    }

    .upload-hint {
      font-size: 13px;
      color: #64748b;
    }

    .text-input-section {
      margin-top: 20px;
    }

    .text-input-section h3 {
      font-size: 16px;
      margin-bottom: 12px;
      color: #333;
    }

    .text-area {
      width: 100%;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      font-family: 'Courier New', monospace;
      resize: vertical;
      margin-bottom: 12px;
      transition: border-color 0.2s;
    }

    .text-area:focus {
      outline: none;
      border-color: #667eea;
    }

    .preview-section {
      padding: 10px 0;
    }

    .preview-section h3 {
      font-size: 18px;
      margin-bottom: 20px;
      color: #333;
    }

    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .info-label {
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 8px;
    }

    .info-value {
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }

    .entities-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .entity-tag {
      background: #667eea;
      color: white;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
    }

    .relationships-list,
    .processes-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .relationship-item,
    .step-item {
      background: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      color: #475569;
      border-left: 3px solid #667eea;
    }

    .process-item {
      background: white;
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #10b981;
    }

    .process-item strong {
      display: block;
      margin-bottom: 8px;
      color: #333;
    }

    .process-steps {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-left: 12px;
    }

    .more-items {
      font-size: 12px;
      color: #94a3b8;
      font-style: italic;
      padding: 4px 0;
    }

    .preview-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      justify-content: flex-end;
    }

    .btn-primary,
    .btn-secondary {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .modal-body::-webkit-scrollbar {
      width: 8px;
    }

    .modal-body::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .modal-body::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    .modal-body::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class DocumentUploaderComponent {
  private processor = inject(DocumentProcessorService);
  private notifications = inject(NotificationService);

  isOpen = signal(false);
  isDragOver = signal(false);
  manualText = '';
  processedDoc = signal<ProcessedDocument | null>(null);

  open() {
    this.isOpen.set(true);
    this.reset();
  }

  close() {
    this.isOpen.set(false);
    this.reset();
  }

  reset() {
    this.manualText = '';
    this.processedDoc.set(null);
    this.isDragOver.set(false);
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      this.notifications.error('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (!content || content.trim().length === 0) {
        this.notifications.error('El archivo está vacío');
        return;
      }

      const processed = this.processor.processDocument(content, file.name);
      this.processedDoc.set(processed);
      this.notifications.success('Documento procesado correctamente');
    };

    reader.onerror = () => {
      this.notifications.error('Error al leer el archivo');
    };

    reader.readAsText(file);
  }

  processManualText() {
    const text = this.manualText.trim();
    
    if (!text) {
      this.notifications.warning('Por favor ingresa algún texto');
      return;
    }

    if (text.length < 50) {
      this.notifications.warning('El texto es muy corto. Ingresa más información.');
      return;
    }

    const processed = this.processor.processDocument(text, 'texto-manual.txt');
    this.processedDoc.set(processed);
    this.notifications.success('Texto procesado correctamente');
  }

  generateDiagram() {
    const doc = this.processedDoc();
    
    if (!doc) {
      return;
    }

    this.processor.generateDiagramFromDocument(doc);
    this.close();
  }

  getDocumentTypeLabel(): string {
    const type = this.processedDoc()?.type;
    
    switch (type) {
      case 'interview':
        return '🎤 Entrevista';
      case 'process':
        return '⚙️ Proceso de Producción';
      case 'requirements':
        return '📋 Requisitos';
      default:
        return '📄 Documento General';
    }
  }
}
