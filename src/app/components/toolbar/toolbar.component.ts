import { Component, ElementRef, viewChild, inject } from '@angular/core';
import { DiagramService } from '../../services/diagram.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  template: `
    <header class="toolbar">
      <div class="toolbar-actions">
        <button class="icon-btn" (click)="onNew()" title="Nuevo">📄</button>
        <button class="icon-btn" (click)="openFileDialog()" title="Abrir .json o .sql">📂</button>
        <button class="icon-btn" (click)="onSave()" title="Guardar .json">💾</button>
        <button class="icon-btn" (click)="diagram.openSqlModal()" title="Ver SQL">SQL</button>
        <span class="separator"></span>
        <button class="icon-btn" [class.icon-btn-active]="diagram.connectingFromShapeId()" (click)="onConnect()" title="Conectar">🔗</button>
      </div>
    </header>
    <input #fileInputRef type="file" accept=".json,.sql" (change)="onFileSelected($event)" hidden>
  `
})
export class ToolbarComponent {
  fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInputRef');
  diagram = inject(DiagramService);
  notifications = inject(NotificationService);

  openFileDialog() { this.fileInputRef()?.nativeElement?.click(); }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const r = new FileReader();
      const name = file.name.toLowerCase();
      r.onload = () => {
        const content = r.result as string;
        if (name.endsWith('.json')) this.diagram.loadDiagramJson(content);
        else if (name.endsWith('.sql')) this.diagram.loadExternalSql(content);
      };
      r.readAsText(file);
    }
    input.value = '';
  }

  onSave() {
    const blob = new Blob([this.diagram.getDiagramJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'diagrama.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  onNew() { this.diagram.newDiagram(); }
  onConnect() { 
    if (this.diagram.connectingFromShapeId()) this.diagram.clearConnectMode();
    else if (this.diagram.selectedShapeId()) this.diagram.startConnectMode();
  }
}