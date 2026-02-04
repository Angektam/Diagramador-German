import { Component, ElementRef, viewChild, inject } from '@angular/core';
import { DiagramService } from '../../services/diagram.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  template: `
    <header class="toolbar">
      <div class="menu-bar">
        <button class="menu-btn" title="Archivo">Archivo</button>
        <button class="menu-btn" title="Editar">Editar</button>
        <button class="menu-btn" title="Ver">Ver</button>
        <button class="menu-btn" title="Diseño">Diseño</button>
        <button class="menu-btn" title="Ayuda">Ayuda</button>
      </div>
      <div class="toolbar-actions">
        <button class="icon-btn" (click)="onNew()" title="Nuevo">📄</button>
        <button class="icon-btn" (click)="openFileDialog()" title="Abrir diagrama">📂</button>
        <button class="icon-btn" (click)="onSave()" title="Guardar diagrama (JSON)">💾</button>
        <button class="icon-btn" (click)="diagram.openSqlModal()" title="Exportar SQL">SQL</button>
        <span class="separator"></span>
        <button class="icon-btn" [class.icon-btn-active]="diagram.connectingFromShapeId()" (click)="onConnect()" title="Conectar formas (selecciona una forma y luego la otra)">🔗</button>
        <span class="separator"></span>
        <button class="icon-btn" (click)="onUndo()" title="Deshacer">↶</button>
        <button class="icon-btn" (click)="onRedo()" title="Rehacer">↷</button>
        <span class="separator"></span>
        <button class="icon-btn" (click)="onZoomOut()" title="Alejar">−</button>
        <span class="zoom-pill" title="Nivel de zoom">{{ diagram.zoomLevel() }}%</span>
        <button class="icon-btn" (click)="onZoomIn()" title="Acercar">+</button>
        <span class="separator"></span>
        <button class="icon-btn" (click)="onDelete()" title="Eliminar">🗑</button>
      </div>
    </header>
    <input #fileInputRef type="file" accept=".json" (change)="onFileSelected($event)" hidden>
  `,
  styles: []
})
export class ToolbarComponent {
  fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInputRef');
  diagram = inject(DiagramService);
  notifications = inject(NotificationService);

  openFileDialog(): void {
    this.fileInputRef()?.nativeElement?.click();
  }

  onNew(): void {
    const hasContent = this.diagram.shapesList().length > 0 || this.diagram.connectionsList().length > 0;
    this.diagram.newDiagram();
    if (hasContent) {
      this.notifications.info('Se creó un nuevo diagrama en blanco');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = () => this.diagram.loadDiagramJson(r.result as string);
      r.readAsText(file);
    }
    input.value = '';
  }

  onSave(): void {
    const blob = new Blob([this.diagram.getDiagramJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'diagrama.json';
    a.click();
    URL.revokeObjectURL(a.href);
    this.notifications.success('Diagrama guardado como diagrama.json');
  }

  onUndo(): void {}
  onRedo(): void {}

  onZoomOut(): void {
    this.diagram.setZoom(this.diagram.zoomLevel() - 10);
  }

  onZoomIn(): void {
    this.diagram.setZoom(this.diagram.zoomLevel() + 10);
  }

  onConnect(): void {
    if (this.diagram.connectingFromShapeId()) {
      this.diagram.clearConnectMode();
      this.notifications.info('Modo conectar cancelado');
      return;
    }
    if (!this.diagram.selectedShapeId()) {
      this.notifications.warning('Selecciona primero una forma y luego pulsa Conectar');
      return;
    }
    this.diagram.startConnectMode();
    this.notifications.info('Haz clic en la forma a la que quieres conectar');
  }

  onDelete(): void {
    const id = this.diagram.selectedShapeId();
    if (id) {
      this.diagram.removeShape(id);
      this.notifications.info('Forma eliminada');
    }
  }
}
