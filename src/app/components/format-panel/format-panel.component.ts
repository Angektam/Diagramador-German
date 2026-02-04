import { Component, inject, effect, untracked, signal, computed } from '@angular/core'; // Se agregó computed
import { DiagramService } from '../../services/diagram.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-format-panel',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="format-panel">
      @if (diagram.selectedShape(); as shape) {
        <h3>Propiedades de Tabla</h3>
        <div class="field">
          <label>Nombre:</label>
          <input [(ngModel)]="tableName" (ngModelChange)="updateName($event)">
        </div>
        <button class="btn-primary" (click)="diagram.openTableModal()">Configurar Columnas</button>
        <hr>
        <h4>Conexiones</h4>
        <ul>
          @for (conn of connections(); track conn.id) {
            <li>
              Hacia: {{ getTargetName(conn.toId) }}
              <button class="btn-danger" (click)="diagram.removeConnection(conn.id)">×</button>
            </li>
          }
        </ul>
      } @else {
        <p>Selecciona una tabla para editar</p>
      }
    </div>
  `,
  styles: []
})
export class FormatPanelComponent {
  diagram = inject(DiagramService);
  tableName = '';

  // Ahora 'computed' está correctamente importado
  connections = computed(() => {
    const id = this.diagram.selectedShapeId();
    return this.diagram.connectionsList().filter(c => c.fromId === id);
  });

  constructor() {
    effect(() => {
      const shape = this.diagram.selectedShape();
      // 'untracked' evita el error NG0600 al escribir en una señal dentro de un efecto
      untracked(() => {
        if (shape && shape.tableData) {
          this.tableName = shape.tableData.name;
        }
      });
    });
  }

  updateName(name: string) {
    const shape = this.diagram.selectedShape();
    if (shape && shape.id) {
      this.diagram.updateShape(shape.id, { 
        tableData: { ...shape.tableData!, name } 
      });
    }
  }

  getTargetName(id: string): string {
    return this.diagram.shapesList().find(s => s.id === id)?.tableData?.name || 'Tabla';
  }
}