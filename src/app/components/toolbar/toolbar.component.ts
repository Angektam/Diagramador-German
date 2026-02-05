import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { DiagramService } from '../../services/diagram.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  standalone: true,
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
        <button (click)="onFileClick()" class="icon-btn" title="Abrir archivo">
          📂
        </button>
        <button (click)="onSaveToGallery()" class="icon-btn" title="Guardar en galería">
          📁
        </button>
        <button (click)="diagram.openSqlModal()" class="icon-btn sql-btn" title="SQL">
          SQL
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
        <button class="icon-btn" title="Alejar">
          −
        </button>
        <div class="zoom-pill">100%</div>
        <button class="icon-btn" title="Acercar">
          +
        </button>
      </div>

      <!-- Spacer -->
      <div style="flex: 1;"></div>

      <!-- Gallery Button -->
      <button (click)="router.navigate(['/gallery'])" class="icon-btn gallery-btn" title="Ver galería">
        🏠
      </button>

      <input #fileInput type="file" (change)="onFile($event)" hidden accept=".json,.sql">
    </header>
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

    .gallery-btn {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .gallery-btn:hover {
      background: rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }
  `]
})
export class ToolbarComponent {
  diagram = inject(DiagramService);
  router = inject(Router);
  authService = inject(AuthService);
  notifications = inject(NotificationService);
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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