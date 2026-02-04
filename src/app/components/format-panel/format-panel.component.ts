import { Component, inject, signal, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiagramService } from '../../services/diagram.service';
import { ValidationService } from '../../services/validation.service';
import { NotificationService } from '../../services/notification.service';

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
          <p class="hint">Selecciona una forma para editar su estilo o conectar con otra.</p>
        } @else {
          <div class="format-section">
            <label>Texto</label>
            <input
              type="text"
              [ngModel]="diagram.selectedShape()?.text"
              (ngModelChange)="updateText($event)"
              placeholder="Texto de la forma"
              [class.input-error]="textError()"
            >
            @if (textError()) {
              <span class="form-error">{{ textError() }}</span>
            }
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
          <div class="format-section connections-section">
            <label>Conexiones</label>
            @if (outgoingConnections().length > 0) {
              <div class="connection-list">
                @for (conn of outgoingConnections(); track conn.id) {
                  <div class="connection-item">
                    <span class="connection-target">→ {{ getShapeLabel(conn.toId) }}</span>
                    <button type="button" class="btn-remove-conn" (click)="removeConnection(conn.id)" title="Quitar conexión">×</button>
                  </div>
                }
              </div>
            }
            @if (otherShapes().length > 0) {
              <div class="connect-row">
                <select class="connect-select" [ngModel]="connectToId()" (ngModelChange)="connectToId.set($event)">
                  <option value="">Conectar a...</option>
                  @for (s of otherShapes(); track s.id) {
                    <option [value]="s.id">{{ getShapeLabel(s.id) }}</option>
                  }
                </select>
                <button type="button" class="btn-primary btn-add-conn" (click)="addConnection()" [disabled]="!connectToId()">Agregar</button>
              </div>
            } @else {
              <p class="connection-hint">Añade otra forma al lienzo para conectar.</p>
            }
          </div>
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
  validation = inject(ValidationService);
  notifications = inject(NotificationService);
  textError = signal<string | null>(null);
  connectToId = signal<string>('');

  otherShapes = computed(() => {
    const list = this.diagram.shapesList();
    const selected = this.diagram.selectedShapeId();
    return list.filter(s => s.id !== selected);
  });

  outgoingConnections = computed(() => {
    const selected = this.diagram.selectedShapeId();
    if (!selected) return [];
    return this.diagram.connectionsList().filter(c => c.fromId === selected);
  });

  constructor() {
    effect(() => {
      this.diagram.selectedShapeId();
      this.textError.set(null);
    });
  }

  updateText(val: string): void {
    this.textError.set(null);
    const result = this.validation.validateShapeName(val ?? '');
    if (!result.valid) {
      this.textError.set(result.error ?? null);
      return;
    }
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

  getShapeLabel(shapeId: string): string {
    const s = this.diagram.shapesList().find(x => x.id === shapeId);
    if (!s) return '(forma)';
    if (s.type === 'table' && s.tableData?.name) return s.tableData.name;
    return (s.text || s.type || '(sin nombre)').toString();
  }

  addConnection(): void {
    const fromId = this.diagram.selectedShapeId();
    const toId = this.connectToId();
    if (!fromId || !toId) return;
    this.diagram.addConnection(fromId, toId);
    this.connectToId.set('');
    this.notifications.success('Conexión agregada');
  }

  removeConnection(connId: string): void {
    this.diagram.removeConnection(connId);
    this.notifications.info('Conexión eliminada');
  }
}
