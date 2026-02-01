import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiagramService } from '../../services/diagram.service';

@Component({
  selector: 'app-format-panel',
  standalone: true,
  imports: [FormsModule],
  template: `
    <aside class="format-panel">
      <div class="panel-header">
        <span>Formato</span>
      </div>
      <div class="format-content">
        @if (!diagram.selectedShape()) {
          <p class="hint">Selecciona una forma para editar su estilo.</p>
        } @else {
          <div class="format-section">
            <label>Texto</label>
            <input type="text" [ngModel]="diagram.selectedShape()?.text" (ngModelChange)="updateText($event)" placeholder="Texto de la forma">
          </div>
          @if (diagram.selectedShape()?.type !== 'table') {
            <div class="format-section">
              <label>Color de relleno</label>
              <input type="color" [ngModel]="diagram.selectedShape()?.fill || '#ffffff'" (ngModelChange)="updateFill($event)">
            </div>
            <div class="format-section">
              <label>Color de borde</label>
              <input type="color" [ngModel]="diagram.selectedShape()?.stroke || '#6366f1'" (ngModelChange)="updateStroke($event)">
            </div>
          }
          @if (diagram.selectedShape()?.type === 'table') {
            <div class="format-section">
              <button type="button" class="btn-primary" (click)="openEditTable()">Editar tabla (columnas y relaciones)</button>
            </div>
          }
        }
      </div>
    </aside>
  `,
  styles: []
})
export class FormatPanelComponent {
  diagram = inject(DiagramService);

  updateText(val: string): void {
    const id = this.diagram.selectedShapeId();
    if (id) this.diagram.updateShape(id, { text: val });
  }
  updateFill(val: string): void {
    const id = this.diagram.selectedShapeId();
    if (id) this.diagram.updateShape(id, { fill: val });
  }
  updateStroke(val: string): void {
    const id = this.diagram.selectedShapeId();
    if (id) this.diagram.updateShape(id, { stroke: val });
  }

  openEditTable(): void {
    this.diagram.openTableModal();
  }
}
