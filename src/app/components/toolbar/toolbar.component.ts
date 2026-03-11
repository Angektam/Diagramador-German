import { Component, inject, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramService } from '../../services/diagram.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { HistoryService } from '../../services/history.service';
import { Router } from '@angular/router';
import { ChatAssistantComponent } from '../chat-assistant/chat-assistant.component';
import { SaveIndicatorComponent } from '../save-indicator/save-indicator.component';
import { DocumentUploaderComponent } from '../document-uploader/document-uploader.component';
import { SchemaTemplatesModalComponent } from '../schema-templates-modal/schema-templates-modal.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, ChatAssistantComponent, SaveIndicatorComponent, DocumentUploaderComponent, SchemaTemplatesModalComponent],
  template: `
    <header class="toolbar">
      <!-- Menu Bar -->
      <div class="menu-bar">
        <div class="menu-item">
          <button class="menu-btn" (click)="toggleMenu('archivo')">Archivo</button>
          <div class="dropdown-menu" *ngIf="activeMenu() === 'archivo'" (click)="closeMenu()">
            <button class="dropdown-item" (click)="onNew()">
              <span class="item-icon">📄</span>
              <span class="item-label">Nuevo</span>
              <span class="item-shortcut">Ctrl+N</span>
            </button>
            <button class="dropdown-item" (click)="onFileClick()">
              <span class="item-icon">📂</span>
              <span class="item-label">Abrir...</span>
              <span class="item-shortcut">Ctrl+O</span>
            </button>
            <button class="dropdown-item" (click)="onSaveToGallery()">
              <span class="item-icon">💾</span>
              <span class="item-label">Guardar en galería</span>
              <span class="item-shortcut">Ctrl+S</span>
            </button>
            <button class="dropdown-item" (click)="onSaveLocal()">
              <span class="item-icon">📥</span>
              <span class="item-label">Descargar JSON</span>
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" (click)="exportAsImage()">
              <span class="item-icon">📸</span>
              <span class="item-label">Exportar imagen</span>
              <span class="item-shortcut">Ctrl+E</span>
            </button>
            <button class="dropdown-item" (click)="diagram.openSqlModal()">
              <span class="item-icon">💾</span>
              <span class="item-label">Importar SQL</span>
            </button>
            <button class="dropdown-item" (click)="openSchemaTemplates()">
              <span class="item-icon">📚</span>
              <span class="item-label">Plantillas de Esquemas</span>
            </button>
            <button class="dropdown-item" (click)="diagram.openSqlGeneratedModal()">
              <span class="item-icon">📝</span>
              <span class="item-label">Generar SQL</span>
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" (click)="router.navigate(['/gallery'])">
              <span class="item-icon">🏠</span>
              <span class="item-label">Ir a galería</span>
            </button>
          </div>
        </div>

        <div class="menu-item">
          <button class="menu-btn" (click)="toggleMenu('editar')">Editar</button>
          <div class="dropdown-menu" *ngIf="activeMenu() === 'editar'" (click)="closeMenu()">
            <button class="dropdown-item" [disabled]="!history.canUndo()" (click)="history.undo()">
              <span class="item-icon">↶</span>
              <span class="item-label">Deshacer</span>
              <span class="item-shortcut">Ctrl+Z</span>
            </button>
            <button class="dropdown-item" [disabled]="!history.canRedo()" (click)="history.redo()">
              <span class="item-icon">↷</span>
              <span class="item-label">Rehacer</span>
              <span class="item-shortcut">Ctrl+Y</span>
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" (click)="copySelected()">
              <span class="item-icon">📄</span>
              <span class="item-label">Copiar</span>
              <span class="item-shortcut">Ctrl+C</span>
            </button>
            <button class="dropdown-item" (click)="cutSelected()">
              <span class="item-icon">✂️</span>
              <span class="item-label">Cortar</span>
              <span class="item-shortcut">Ctrl+X</span>
            </button>
            <button class="dropdown-item" disabled>
              <span class="item-icon">📋</span>
              <span class="item-label">Pegar</span>
              <span class="item-shortcut">Ctrl+V</span>
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" (click)="diagram.selectAllShapes()">
              <span class="item-icon">✅</span>
              <span class="item-label">Seleccionar todo</span>
              <span class="item-shortcut">Ctrl+A</span>
            </button>
            <button class="dropdown-item" (click)="diagram.deleteSelectedShapes()">
              <span class="item-icon">🗑️</span>
              <span class="item-label">Eliminar</span>
              <span class="item-shortcut">Del</span>
            </button>
          </div>
        </div>

        <div class="menu-item">
          <button class="menu-btn" (click)="toggleMenu('ver')">Ver</button>
          <div class="dropdown-menu" *ngIf="activeMenu() === 'ver'" (click)="closeMenu()">
            <button class="dropdown-item" (click)="diagram.setZoom(diagram.zoomLevel() + 10)">
              <span class="item-icon">🔍</span>
              <span class="item-label">Acercar</span>
              <span class="item-shortcut">Ctrl++</span>
            </button>
            <button class="dropdown-item" (click)="diagram.setZoom(diagram.zoomLevel() - 10)">
              <span class="item-icon">🔍</span>
              <span class="item-label">Alejar</span>
              <span class="item-shortcut">Ctrl+-</span>
            </button>
            <button class="dropdown-item" (click)="diagram.setZoom(100)">
              <span class="item-icon">⊙</span>
              <span class="item-label">Zoom 100%</span>
              <span class="item-shortcut">Ctrl+0</span>
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" (click)="themeService.toggleTheme()">
              <span class="item-icon">{{ themeService.theme() === 'dark' ? '☀️' : '🌙' }}</span>
              <span class="item-label">{{ themeService.theme() === 'dark' ? 'Tema claro' : 'Tema oscuro' }}</span>
            </button>
          </div>
        </div>

        <div class="menu-item">
          <button class="menu-btn" (click)="toggleMenu('diseño')">Diseño</button>
          <div class="dropdown-menu" *ngIf="activeMenu() === 'diseño'" (click)="closeMenu()">
            <button class="dropdown-item" (click)="diagram.openTemplatesModal()">
              <span class="item-icon">📋</span>
              <span class="item-label">Plantillas</span>
            </button>
            <button class="dropdown-item" (click)="assistant.open()">
              <span class="item-icon">🧙‍♂️</span>
              <span class="item-label">Asistente IA</span>
            </button>
            <button class="dropdown-item" (click)="documentUploader.open()">
              <span class="item-icon">📄</span>
              <span class="item-label">Cargar documento</span>
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" disabled>
              <span class="item-icon">📐</span>
              <span class="item-label">Auto-organizar</span>
            </button>
            <button class="dropdown-item" disabled>
              <span class="item-icon">🎨</span>
              <span class="item-label">Cambiar colores</span>
            </button>
          </div>
        </div>

        <div class="menu-item">
          <button class="menu-btn" (click)="toggleMenu('ayuda')">Ayuda</button>
          <div class="dropdown-menu" *ngIf="activeMenu() === 'ayuda'" (click)="closeMenu()">
            <button class="dropdown-item" (click)="openShortcutsHelp()">
              <span class="item-icon">⌨️</span>
              <span class="item-label">Atajos de teclado</span>
              <span class="item-shortcut">?</span>
            </button>
            <button class="dropdown-item" (click)="showAbout()">
              <span class="item-icon">ℹ️</span>
              <span class="item-label">Acerca de</span>
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" (click)="showTutorial()">
              <span class="item-icon">📚</span>
              <span class="item-label">Tutorial</span>
            </button>
          </div>
        </div>
      </div>

      <div class="separator"></div>

      <!-- Toolbar Actions -->
      <div class="toolbar-actions">
        <button (click)="onNew()" class="icon-btn" title="Nuevo diagrama">
          📄
        </button>
        <button (click)="assistant.open()" class="icon-btn assistant-btn" title="Asistente de diagramas">
          🧙‍♂️
        </button>
        <button (click)="documentUploader.open()" class="icon-btn document-btn" title="Cargar documento">
          📄
        </button>
        <button (click)="diagram.openTemplatesModal()" class="icon-btn templates-btn" title="Plantillas">
          📋
        </button>
        <button (click)="onFileClick()" class="icon-btn" title="Abrir archivo">
          📂
        </button>
        <button (click)="onSaveToGallery()" class="icon-btn" title="Guardar en galería">
          📁
        </button>
        <button (click)="diagram.openSqlModal()" class="icon-btn sql-btn" title="SQL">
          SQL
        </button>
        <button (click)="exportAsImage()" class="icon-btn" title="Exportar como imagen">
          📸
        </button>
      </div>

      <div class="separator"></div>

      <!-- Navigation -->
      <div class="toolbar-actions">
        <button (click)="history.undo()" [disabled]="!history.canUndo()" class="icon-btn" title="Deshacer (Ctrl+Z)">
          ↶
        </button>
        <button (click)="history.redo()" [disabled]="!history.canRedo()" class="icon-btn" title="Rehacer (Ctrl+Y)">
          ↷
        </button>
      </div>

      <div class="separator"></div>

      <!-- Zoom Controls -->
      <div class="toolbar-actions">
        <button (click)="diagram.setZoom(diagram.zoomLevel() - 10)" class="icon-btn" title="Alejar (Ctrl + Rueda)">
          −
        </button>
        <div class="zoom-pill">{{ diagram.zoomLevel() }}%</div>
        <button (click)="diagram.setZoom(diagram.zoomLevel() + 10)" class="icon-btn" title="Acercar (Ctrl + Rueda)">
          +
        </button>
        <button (click)="diagram.setZoom(100)" class="icon-btn" title="Restablecer zoom">
          ⊙
        </button>
      </div>

      <!-- Spacer -->
      <div style="flex: 1;"></div>
      
      <!-- Save Indicator -->
      <app-save-indicator />
      
      <!-- Selection Info -->
      @if (diagram.selectedShapeIds().length > 0) {
        <div class="selection-info">
          {{ diagram.selectedShapeIds().length }} seleccionada(s)
        </div>
      }

      <!-- Theme Toggle -->
      <button 
        (click)="themeService.toggleTheme()" 
        class="icon-btn theme-btn" 
        [title]="themeService.theme() === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'">
        {{ themeService.theme() === 'dark' ? '☀️' : '🌙' }}
      </button>

      <!-- Shortcuts Help -->
      <button 
        (click)="openShortcutsHelp()" 
        class="icon-btn help-btn" 
        title="Atajos de teclado (?)">
        ⌨️
      </button>

      <!-- Gallery Button -->
      <button (click)="router.navigate(['/gallery'])" class="icon-btn gallery-btn" title="Ver galería">
        🏠
      </button>

      <input #fileInput type="file" (change)="onFile($event)" hidden accept=".json,.sql">
    </header>
    
    <!-- Assistant Modal -->
    <app-chat-assistant #assistant></app-chat-assistant>
    
    <!-- Document Uploader Modal -->
    <app-document-uploader #documentUploader></app-document-uploader>
    
    <!-- Schema Templates Modal -->
    @if (showSchemaTemplates()) {
      <app-schema-templates-modal (close)="closeSchemaTemplates()"></app-schema-templates-modal>
    }
  `,
  styles: [`
    .menu-bar {
      display: flex;
      gap: 2px;
      position: relative;
      padding: 0 8px;
    }

    .menu-item {
      position: relative;
    }

    .menu-btn {
      padding: 8px 16px;
      background: transparent;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      border-radius: 6px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: 0.3px;
    }

    .menu-btn:hover {
      background: rgba(99, 102, 241, 0.1);
      color: var(--accent);
    }

    .menu-btn:active {
      transform: scale(0.96);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 8px;
      background: #1a1a1a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.5),
        0 10px 10px -5px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.05);
      min-width: 260px;
      padding: 8px;
      z-index: 10000;
      animation: menuFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    /* Fondo completamente opaco en modo claro */
    :host-context(.light-theme) .dropdown-menu {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(0, 0, 0, 0.02);
    }

    @keyframes menuFadeIn {
      from {
        opacity: 0;
        transform: translateY(-12px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 11px 16px;
      border: none;
      background: transparent;
      color: #e5e7eb;
      cursor: pointer;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: left;
      position: relative;
      overflow: hidden;
    }

    .dropdown-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--accent);
      transform: scaleY(0);
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dropdown-item:hover:not(:disabled) {
      background: rgba(99, 102, 241, 0.12);
      color: #ffffff;
      transform: translateX(4px);
    }

    .dropdown-item:hover:not(:disabled)::before {
      transform: scaleY(1);
    }

    .dropdown-item:active:not(:disabled) {
      transform: translateX(4px) scale(0.98);
      background: rgba(99, 102, 241, 0.18);
    }

    .dropdown-item:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      color: #6b7280;
    }

    /* Items en modo claro */
    :host-context(.light-theme) .dropdown-item {
      color: #1f2937;
    }

    :host-context(.light-theme) .dropdown-item:hover:not(:disabled) {
      background: rgba(99, 102, 241, 0.08);
      color: #111827;
    }

    :host-context(.light-theme) .dropdown-item:active:not(:disabled) {
      background: rgba(99, 102, 241, 0.12);
    }

    :host-context(.light-theme) .dropdown-item:disabled {
      color: #9ca3af;
    }

    .item-icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
      filter: grayscale(0.2);
      transition: filter 0.2s;
    }

    .dropdown-item:hover:not(:disabled) .item-icon {
      filter: grayscale(0);
    }

    .item-label {
      flex: 1;
      font-weight: 500;
      letter-spacing: 0.2px;
    }

    .item-shortcut {
      font-size: 11px;
      color: #9ca3af;
      font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
      background: rgba(255, 255, 255, 0.08);
      padding: 3px 8px;
      border-radius: 5px;
      flex-shrink: 0;
      font-weight: 600;
      letter-spacing: 0.5px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    :host-context(.light-theme) .item-shortcut {
      background: rgba(0, 0, 0, 0.06);
      color: #6b7280;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .dropdown-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      margin: 8px 0;
    }

    :host-context(.light-theme) .dropdown-divider {
      background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
    }

    .sql-btn {
      background: var(--accent-light);
      color: var(--accent);
      font-weight: 600;
      font-size: 11px;
      min-width: 36px;
    }

    .sql-btn:hover {
      background: var(--accent);
      color: white;
    }

    .assistant-btn {
      background: rgba(251, 191, 36, 0.15);
      color: #f59e0b;
      font-size: 18px;
      animation: pulse 2s ease-in-out infinite;
    }
    
    .assistant-btn:hover {
      background: rgba(251, 191, 36, 0.25);
      transform: scale(1.1);
      animation: none;
    }
    
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(251, 191, 36, 0);
      }
    }

    .templates-btn {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
      font-size: 18px;
    }

    .templates-btn:hover {
      background: rgba(139, 92, 246, 0.2);
      transform: scale(1.05);
    }

    .gallery-btn {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .gallery-btn:hover {
      background: rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .theme-btn {
      background: rgba(251, 191, 36, 0.15);
      color: #f59e0b;
      font-size: 18px;
      transition: all 0.3s ease;
    }

    .theme-btn:hover {
      background: rgba(251, 191, 36, 0.25);
      transform: scale(1.1) rotate(20deg);
    }

    .help-btn {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
      font-size: 18px;
    }

    .help-btn:hover {
      background: rgba(34, 197, 94, 0.25);
      transform: scale(1.1);
    }

    .document-btn {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
      font-size: 18px;
    }

    .document-btn:hover {
      background: rgba(59, 130, 246, 0.25);
      transform: scale(1.1);
    }
    
    .selection-info {
      padding: 6px 12px;
      background: var(--accent-light);
      color: var(--accent);
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 600;
      border: 1px solid rgba(99, 102, 241, 0.3);
      margin-right: 8px;
    }
  `]
})
export class ToolbarComponent {
  diagram = inject(DiagramService);
  router = inject(Router);
  authService = inject(AuthService);
  notifications = inject(NotificationService);
  themeService = inject(ThemeService);
  history = inject(HistoryService);
  
  activeMenu = signal<string | null>(null);
  showSchemaTemplates = signal(false);
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('assistant') assistant!: ChatAssistantComponent;
  @ViewChild('documentUploader') documentUploader!: DocumentUploaderComponent;

  ngOnInit() {
    // Escuchar evento para abrir el modal de documentos
    window.addEventListener('open-document-uploader', () => {
      if (this.documentUploader) {
        this.documentUploader.open();
      }
    });

    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.menu-item')) {
        this.closeMenu();
      }
    });
  }

  toggleMenu(menu: string): void {
    if (this.activeMenu() === menu) {
      this.closeMenu();
    } else {
      this.activeMenu.set(menu);
    }
  }

  closeMenu(): void {
    this.activeMenu.set(null);
  }

  copySelected(): void {
    this.notifications.info('Función de copiar en desarrollo');
  }

  cutSelected(): void {
    this.notifications.info('Función de cortar en desarrollo');
  }

  showAbout(): void {
    this.notifications.info('Diagramador SQL v1.1.0 - Febrero 2026');
  }

  showTutorial(): void {
    this.notifications.info('Tutorial en desarrollo');
  }

  openShortcutsHelp(): void {
    // Disparar evento personalizado para abrir el modal de atajos
    window.dispatchEvent(new CustomEvent('open-shortcuts-help'));
  }

  openSchemaTemplates(): void {
    this.showSchemaTemplates.set(true);
  }

  closeSchemaTemplates(): void {
    this.showSchemaTemplates.set(false);
  }

  getCurrentUser(): string {
    return this.authService.user()?.username || 'Usuario';
  }

  onFileClick() {
    this.fileInput.nativeElement.click();
  }

  onNew() { 
    if (confirm('¿Crear un nuevo diagrama? Se perderán los cambios no guardados.')) {
      this.diagram.newDiagram();
      this.notifications.success('Nuevo diagrama creado');
    }
  }
  
  onSaveLocal() {
    try {
      const blob = new Blob([this.diagram.getDiagramJson()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagrama-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.notifications.success('Diagrama descargado');
    } catch (error) {
      this.notifications.error('Error al descargar el archivo');
    }
  }

  onSaveToGallery() {
    const name = prompt('Nombre del diagrama:', `Diagrama ${new Date().toLocaleDateString()}`);
    if (name) {
      this.diagram.saveToGallery(name);
    }
  }

  exportAsImage() {
    const format = confirm('¿Exportar como PNG? (Cancelar para SVG)') ? 'png' : 'svg';
    this.diagram.exportAsImage(format);
  }

  onFile(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Detectar tipo de archivo por extensión
        if (file.name.endsWith('.json')) {
          // Intentar parsear como JSON
          try {
            JSON.parse(content);
            this.diagram.loadDiagramJson(content);
            this.notifications.success('Diagrama cargado correctamente');
          } catch (jsonError) {
            this.notifications.error('El archivo JSON no es válido');
          }
        } else if (file.name.endsWith('.sql')) {
          // Cargar como SQL
          this.diagram.loadExternalSql(content);
          this.notifications.success('Archivo SQL procesado');
        } else {
          // Intentar detectar automáticamente
          try {
            // Intentar como JSON primero
            JSON.parse(content);
            this.diagram.loadDiagramJson(content);
            this.notifications.success('Diagrama cargado correctamente');
          } catch {
            // Si falla, intentar como SQL
            this.diagram.loadExternalSql(content);
            this.notifications.success('Archivo procesado como SQL');
          }
        }
      } catch (error) {
        this.notifications.error('Error al cargar el archivo');
        console.error('Error loading file:', error);
      }
    };
    
    reader.onerror = () => {
      this.notifications.error('Error al leer el archivo');
    };
    
    reader.readAsText(file);
    
    // Reset input para permitir cargar el mismo archivo de nuevo
    event.target.value = '';
  }
}