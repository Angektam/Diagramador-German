import { Injectable, signal, computed, inject } from '@angular/core';
import { DiagramShape, Connection } from '../models/diagram.model';
import { ValidationService } from './validation.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class DiagramService {
  private validation = inject(ValidationService);
  private notifications = inject(NotificationService);

  private shapes = signal<DiagramShape[]>([]);
  private connections = signal<Connection[]>([]);
  private selectedId = signal<string | null>(null);
  private connectingFromId = signal<string | null>(null);
  private zoom = signal(100);
  private history = signal<DiagramShape[][]>([]);
  private historyIndex = signal(-1);
  
  private externalSql = signal<string | null>(null);
  
  sqlModalOpen = signal(false);
  tableModalOpen = signal(false);

  readonly shapesList = this.shapes.asReadonly();
  readonly connectionsList = this.connections.asReadonly();
  readonly selectedShapeId = this.selectedId.asReadonly();
  readonly connectingFromShapeId = this.connectingFromId.asReadonly();
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
    this.connections.update(list => list.filter(c => c.fromId !== id && c.toId !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  selectShape(id: string | null): void {
    this.selectedId.set(id);
  }

  startConnectMode(): boolean {
    const id = this.selectedId();
    if (!id) return false;
    this.connectingFromId.set(id);
    return true;
  }

  clearConnectMode(): void {
    this.connectingFromId.set(null);
  }

  connectToShape(toId: string): boolean {
    const fromId = this.connectingFromId();
    if (!fromId || fromId === toId) return false;
    this.addConnection(fromId, toId);
    this.connectingFromId.set(null);
    this.selectedId.set(toId);
    return true;
  }

  setZoom(value: number): void {
    this.zoom.set(Math.max(25, Math.min(200, value)));
  }

  addConnection(fromId: string, toId: string): void {
    if (fromId === toId) return;
    const exists = this.connections().some(c => c.fromId === fromId && c.toId === toId);
    if (exists) return;
    this.connections.update(list => [...list, { id: `conn-${Date.now()}`, fromId, toId }]);
  }

  removeConnection(id: string): void {
    this.connections.update(list => list.filter(c => c.id !== id));
  }

  newDiagram(): void {
    this.shapes.set([]);
    this.connections.set([]);
    this.selectedId.set(null);
    this.connectingFromId.set(null);
    this.zoom.set(100);
    this.externalSql.set(null);
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
    return JSON.stringify({ shapes: this.shapes(), connections: this.connections(), zoom: this.zoom() }, null, 2);
  }

  loadDiagramJson(json: string): void {
    const result = this.validation.validateDiagramJson(json);
    if (!result.valid) {
      this.notifications.error(result.error ?? 'Error al validar');
      return;
    }
    const data = result.data!;
    this.externalSql.set(null);
    this.shapes.set(data.shapes ?? []);
    this.connections.set(data.connections ?? []);
    this.zoom.set(data.zoom ?? 100);
    this.notifications.success('Diagrama cargado');
  }

  loadExternalSql(sql: string): void {
    this.externalSql.set(sql);
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:['"\[`\w]+\.)?(['"\[`\w]+)\s*\(([\s\S]*?)\);/gi;
    let match;
    let count = 0;
    let posX = 50, posY = 50;
    const newShapes: DiagramShape[] = [];

    while ((match = tableRegex.exec(sql)) !== null) {
      const tableName = match[1].replace(/['"\[`\]]/g, '');
      const colContent = match[2].trim();
      const colLines = colContent.split(/,(?![^\(]*\))/);

      const columns = colLines.map(line => {
        const parts = line.trim().split(/\s+/);
        const name = parts[0].replace(/['"\[`\]]/g, '');
        if (['PRIMARY', 'CONSTRAINT', 'FOREIGN', 'KEY'].includes(name.toUpperCase())) return null;
        return {
          name,
          type: (parts[1] || 'VARCHAR').toUpperCase(),
          pk: line.toUpperCase().includes('PRIMARY KEY'),
          fk: line.toUpperCase().includes('REFERENCES') ? line.split(/REFERENCES\s+/i)[1].split(/\s+/)[0].trim().replace(/['"\[`\]]/g, '') : undefined
        };
      }).filter(c => c !== null);

      newShapes.push({
        id: `table-sql-${count}-${Date.now()}`,
        type: 'table',
        x: posX, y: posY, width: 220, height: 180,
        tableData: { name: tableName, columns: columns as any }
      });
      posX += 250;
      if (posX > 1000) { posX = 50; posY += 250; }
      count++;
    }

    if (newShapes.length > 0) {
      this.shapes.set(newShapes);
      this.notifications.success(`Importadas ${count} tablas`);
      this.sqlModalOpen.set(false);
    } else {
      this.sqlModalOpen.set(true);
      this.notifications.warning('No se encontraron tablas válidas.');
    }
  }

  generateSql(): string {
    if (this.externalSql()) return this.externalSql()!;
    const tables = this.shapes().filter(s => s.type === 'table' && s.tableData);
    return tables.length === 0 ? '-- No hay tablas' : tables.map(t => {
      const td = t.tableData!;
      const cols = td.columns.map(c => `  ${c.name} ${c.type}${c.pk ? ' PRIMARY KEY' : ''}${c.fk ? ` REFERENCES ${c.fk}` : ''}`).join(',\n');
      return `CREATE TABLE ${td.name} (\n${cols}\n);`;
    }).join('\n\n');
  }

  openSqlModal() { this.sqlModalOpen.set(true); }
  closeSqlModal() { this.sqlModalOpen.set(false); }
  openTableModal() { this.tableModalOpen.set(true); }
  closeTableModal() { this.tableModalOpen.set(false); }
}