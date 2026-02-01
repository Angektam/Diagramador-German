import { Injectable, signal, computed } from '@angular/core';
import { DiagramShape, Connection, TableData } from '../models/diagram.model';

@Injectable({ providedIn: 'root' })
export class DiagramService {
  private shapes = signal<DiagramShape[]>([]);
  private connections = signal<Connection[]>([]);
  private selectedId = signal<string | null>(null);
  private zoom = signal(100);
  private history = signal<DiagramShape[][]>([]);
  private historyIndex = signal(-1);
  sqlModalOpen = signal(false);
  tableModalOpen = signal(false);

  readonly shapesList = this.shapes.asReadonly();
  readonly connectionsList = this.connections.asReadonly();
  readonly selectedShapeId = this.selectedId.asReadonly();
  readonly zoomLevel = this.zoom.asReadonly();

  readonly selectedShape = computed(() => {
    const id = this.selectedId();
    return id ? this.shapes().find(s => s.id === id) ?? null : null;
  });

  addShape(shape: DiagramShape): void {
    this.saveHistory();
    this.shapes.update(list => [...list, shape]);
  }

  updateShape(id: string, updates: Partial<DiagramShape>): void {
    this.shapes.update(list =>
      list.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  }

  removeShape(id: string): void {
    this.saveHistory();
    this.shapes.update(list => list.filter(s => s.id !== id));
    this.connections.update(list =>
      list.filter(c => c.fromId !== id && c.toId !== id)
    );
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  selectShape(id: string | null): void {
    this.selectedId.set(id);
  }

  setZoom(value: number): void {
    this.zoom.set(Math.max(25, Math.min(200, value)));
  }

  addConnection(fromId: string, toId: string): void {
    this.connections.update(list => [
      ...list,
      { id: `conn-${Date.now()}`, fromId, toId }
    ]);
  }

  newDiagram(): void {
    this.shapes.set([]);
    this.connections.set([]);
    this.selectedId.set(null);
    this.zoom.set(100);
  }

  private saveHistory(): void {
    const current = JSON.parse(JSON.stringify(this.shapes()));
    this.history.update(h => {
      const next = h.slice(0, this.historyIndex() + 1);
      next.push(current);
      return next.slice(-50);
    });
    this.historyIndex.set(this.history().length - 1);
  }

  getDiagramJson(): string {
    return JSON.stringify({
      shapes: this.shapes(),
      connections: this.connections(),
      zoom: this.zoom()
    }, null, 2);
  }

  loadDiagramJson(json: string): void {
    try {
      const data = JSON.parse(json);
      this.shapes.set(data.shapes ?? []);
      this.connections.set(data.connections ?? []);
      this.zoom.set(data.zoom ?? 100);
    } catch {
      console.error('Error al cargar el diagrama');
    }
  }

  openSqlModal(): void {
    this.sqlModalOpen.set(true);
  }

  closeSqlModal(): void {
    this.sqlModalOpen.set(false);
  }

  openTableModal(): void {
    this.tableModalOpen.set(true);
  }

  closeTableModal(): void {
    this.tableModalOpen.set(false);
  }

  generateSql(): string {
    const tables = this.shapes().filter(s => s.type === 'table' && s.tableData);
    if (tables.length === 0) return '-- No hay tablas en el diagrama';

    let sql = '';
    for (const t of tables) {
      const td = t.tableData!;
      sql += `CREATE TABLE ${td.name} (\n`;
      sql += td.columns
        .map(
          c =>
            `  ${c.name} ${c.type}${c.pk ? ' PRIMARY KEY' : ''}${c.fk ? ` REFERENCES ${c.fk}` : ''}`
        )
        .join(',\n');
      sql += '\n);\n\n';
    }
    return sql.trim();
  }
}
