import { Component, inject, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiagramService } from '../../services/diagram.service';
import { ValidationService } from '../../services/validation.service';
import { NotificationService } from '../../services/notification.service';
import { TableColumn } from '../../models/diagram.model';

@Component({
  selector: 'app-modal-table',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-overlay" [class.hidden]="!diagram.tableModalOpen()" (click)="onOverlayClick($event)">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Editar tabla</h2>
          <button type="button" class="modal-close" (click)="close()">×</button>
        </div>
        <div class="modal-body">
          @if (validationErrors().length > 0) {
            <div class="validation-errors" role="alert">
              @for (err of validationErrors(); track err) {
                <span class="form-error">{{ err }}</span>
              }
            </div>
          }
          <label>Nombre de la tabla</label>
          <input
            type="text"
            [(ngModel)]="tableName"
            placeholder="ej: usuarios"
            [class.input-error]="validationErrors().length > 0"
            (ngModelChange)="clearValidationErrors()"
          >
          <label>Columnas</label>
          <div class="columns-list">
            @for (col of columns; track col; let i = $index) {
              <div class="column-row" [class.has-error]="columnError(i)">
                <input type="text" [(ngModel)]="col.name" placeholder="nombre" (ngModelChange)="touchColumns(); clearValidationErrors()">
                <select [(ngModel)]="col.type" (ngModelChange)="touchColumns(); clearValidationErrors()">
                  <option value="INT">INT</option>
                  <option value="VARCHAR">VARCHAR</option>
                  <option value="TEXT">TEXT</option>
                  <option value="DATE">DATE</option>
                  <option value="DECIMAL">DECIMAL</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                  <option value="BIGINT">BIGINT</option>
                  <option value="FLOAT">FLOAT</option>
                  <option value="DATETIME">DATETIME</option>
                </select>
                <label class="checkbox">
                  <input type="checkbox" [(ngModel)]="col.pk" (ngModelChange)="touchColumns()"> PK
                </label>
                <input type="text" [(ngModel)]="col.fk" placeholder="FK → tabla" (ngModelChange)="touchColumns(); clearValidationErrors()" class="col-ref">
                <button type="button" class="btn-remove-col" (click)="removeColumn(i)">Eliminar</button>
              </div>
            }
          </div>
          <button type="button" class="btn-secondary" (click)="addColumn()">+ Añadir columna</button>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" (click)="close()">Cancelar</button>
          <button type="button" class="btn-primary" (click)="apply()">Aplicar</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModalTableComponent {
  diagram = inject(DiagramService);
  validation = inject(ValidationService);
  notifications = inject(NotificationService);
  tableName = '';
  columns: TableColumn[] = [];
  validationErrors = signal<string[]>([]);

  constructor() {
    effect(() => {
      if (this.diagram.tableModalOpen()) {
        const shape = this.diagram.selectedShape();
        if (shape?.type === 'table' && shape.tableData) {
          this.tableName = shape.tableData.name;
          this.columns = shape.tableData.columns.map(c => ({ ...c }));
          this.validationErrors.set([]);
        }
      }
    });
  }

  touchColumns(): void {
    this.columns = [...this.columns];
  }

  clearValidationErrors(): void {
    this.validationErrors.set([]);
  }

  columnError(index: number): boolean {
    const errs = this.validationErrors();
    return errs.some(e => e.startsWith(`Columna ${index + 1}:`));
  }

  addColumn(): void {
    this.columns = [...this.columns, { name: 'columna', type: 'VARCHAR' }];
  }

  removeColumn(i: number): void {
    this.columns = this.columns.filter((_, idx) => idx !== i);
  }

  close(): void {
    this.diagram.closeTableModal();
    this.validationErrors.set([]);
  }

  onOverlayClick(e: Event): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close();
  }

  apply(): void {
    const tableData = { name: this.tableName.trim(), columns: this.columns.map(c => ({
      ...c,
      name: (c.name ?? '').trim(),
      type: (c.type ?? '').trim(),
      fk: c.fk ? String(c.fk).trim() || undefined : undefined
    })) };
    const result = this.validation.validateTableData(tableData);

    if (!result.valid) {
      this.validationErrors.set(result.errors);
      this.notifications.error(result.errors[0], 6000);
      return;
    }

    const id = this.diagram.selectedShapeId();
    if (id) {
      this.diagram.updateShape(id, { tableData });
      this.notifications.success('Tabla guardada correctamente');
    }
    this.close();
  }
}
