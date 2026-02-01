import { Component, ElementRef, viewChild } from '@angular/core';
import { DiagramService } from '../../services/diagram.service';

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
        <button class="icon-btn" (click)="onUndo()" title="Deshacer">↶</button>
        <button class="icon-btn" (click)="onRedo()" title="Rehacer">↷</button>
        <span class="separator"></span>
        <button class="icon-btn" (click)="onZoomOut()" title="Alejar">−</button>
        <span class="zoom-label">{{ diagram.zoomLevel() }}%</span>
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

  constructor(public diagram: DiagramService) {}

  openFileDialog(): void {
    this.fileInputRef()?.nativeElement?.click();
  }

  onNew(): void {
    this.diagram.newDiagram();
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
  }

  onUndo(): void {}
  onRedo(): void {}

  onZoomOut(): void {
    this.diagram.setZoom(this.diagram.zoomLevel() - 10);
  }

  onZoomIn(): void {
    this.diagram.setZoom(this.diagram.zoomLevel() + 10);
  }

  onDelete(): void {
    const id = this.diagram.selectedShapeId();
    if (id) this.diagram.removeShape(id);
  }
}
