import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { DiagramService } from '../../services/diagram.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { Router } from '@angular/router';
import { ChatAssistantComponent } from '../chat-assistant/chat-assistant.component';
import { SaveIndicatorComponent } from '../save-indicator/save-indicator.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [ChatAssistantComponent, SaveIndicatorComponent],
  template: `
    <header class="toolbar">
      <!-- Menu Bar -->
      <div class="menu-bar">
        <button class="menu-btn">Archivo</button>
        <button class="menu-btn">Editar</button>
        <button class="menu-btn">Ver</button>
        <button class="menu-btn">Diseño</button>
        <button class="menu-btn">Ayuda</button>
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
        <button class="icon-btn" title="Deshacer">
          ↶
        </button>
        <button class="icon-btn" title="Rehacer">
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
  `,
  styles: [`
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
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('assistant') assistant!: ChatAssistantComponent;

  openShortcutsHelp(): void {
    // Disparar evento personalizado para abrir el modal de atajos
    window.dispatchEvent(new CustomEvent('open-shortcuts-help'));
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