import { Component, inject, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiagramService } from '../../services/diagram.service';
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
          <label>Nombre de la tabla</label>
          <input type="text" [(ngModel)]="tableName" placeholder="ej: usuarios">
          <label>Columnas</label>
          <div class="columns-list">
            @for (col of columns; track col; let i = $index) {
              <div class="column-row">
                <input type="text" [(ngModel)]="col.name" placeholder="nombre" (ngModelChange)="touchColumns()">
                <select [(ngModel)]="col.type" (ngModelChange)="touchColumns()">
                  <option value="INT">INT</option>
                  <option value="VARCHAR">VARCHAR</option>
                  <option value="TEXT">TEXT</option>
                  <option value="DATE">DATE</option>
                  <option value="DECIMAL">DECIMAL</option>
                </select>
                <label class="checkbox">
                  <input type="checkbox" [(ngModel)]="col.pk" (ngModelChange)="touchColumns()"> PK
                </label>
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
  tableName = '';
  columns: TableColumn[] = [];

  constructor() {
    effect(() => {
      if (this.diagram.tableModalOpen()) {
        const shape = this.diagram.selectedShape();
        if (shape?.type === 'table' && shape.tableData) {
          this.tableName = shape.tableData.name;
          this.columns = shape.tableData.columns.map(c => ({ ...c }));
        }
      }
    });
  }

  touchColumns(): void {
    this.columns = [...this.columns];
  }

  addColumn(): void {
    this.columns = [...this.columns, { name: 'columna', type: 'VARCHAR' }];
  }

  removeColumn(i: number): void {
    this.columns = this.columns.filter((_, idx) => idx !== i);
  }

  close(): void {
    this.diagram.closeTableModal();
  }

  onOverlayClick(e: Event): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close();
  }

  apply(): void {
    const id = this.diagram.selectedShapeId();
    if (id) {
      this.diagram.updateShape(id, {
        tableData: { name: this.tableName, columns: [...this.columns] }
      });
    }
    this.close();
  }
}
