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

  // --- MÉTODOS DE GALERÍA ---
  saveToGallery(name: string) {
    const currentData = this.getDiagramJson();
    const saved = JSON.parse(localStorage.getItem('sql_diagrams_gallery') || '[]');
    
    // Get current user ID if available
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const userId = currentUser?.id;
    
    saved.push({
      id: 'map-' + Date.now(),
      name: name || 'Diagrama sin nombre',
      date: new Date(),
      data: currentData,
      userId: userId
    });
    localStorage.setItem('sql_diagrams_gallery', JSON.stringify(saved));
    this.notifications.success('Guardado en la galería');
  }

  // --- LÓGICA DE EDITOR ---
  addShape(shape: DiagramShape) { this.shapes.update(l => [...l, shape]); }
  
  updateShape(id: string, updates: Partial<DiagramShape>) {
    this.shapes.update(l => l.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  removeShape(id: string) {
    this.shapes.update(l => l.filter(s => s.id !== id));
    this.connections.update(l => l.filter(c => c.fromId !== id && c.toId !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  selectShape(id: string | null) { this.selectedId.set(id); }
  setZoom(v: number) { this.zoom.set(Math.max(25, Math.min(200, v))); }

  newDiagram() {
    this.shapes.set([]);
    this.connections.set([]);
    this.externalSql.set(null);
  }

  getDiagramJson() {
    return JSON.stringify({ shapes: this.shapes(), connections: this.connections(), zoom: this.zoom() });
  }

  loadDiagramJson(json: string) {
    try {
      const data = JSON.parse(json);
      this.shapes.set(data.shapes || []);
      this.connections.set(data.connections || []);
      this.zoom.set(data.zoom || 100);
    } catch (e) { this.notifications.error('Error al cargar JSON'); }
  }

  loadExternalSql(sql: string) {
    this.externalSql.set(sql);
    const tableRegex = /CREATE\s+TABLE\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
    let match;
    const newShapes: DiagramShape[] = [];
    let px = 50, py = 50;

    while ((match = tableRegex.exec(sql)) !== null) {
      const colLines = match[2].trim().split(/,(?![^\(]*\))/);
      const columns = colLines.map(l => {
        const p = l.trim().split(/\s+/);
        return { name: p[0], type: p[1] || 'VARCHAR', pk: l.toUpperCase().includes('PRIMARY KEY') };
      }).filter(c => !['PRIMARY', 'KEY', 'CONSTRAINT'].includes(c.name.toUpperCase()));

      newShapes.push({
        id: 't-' + Math.random(),
        type: 'table', x: px, y: py, width: 200, height: 150,
        tableData: { name: match[1], columns: columns as any }
      });
      px += 250; if (px > 800) { px = 50; py += 200; }
    }

    if (newShapes.length > 0) {
      this.shapes.set(newShapes);
      this.notifications.success('SQL importado visualmente');
    } else {
      this.sqlModalOpen.set(true);
      this.notifications.warning('No se detectaron tablas, mostrando texto.');
    }
  }

  generateSql() {
    if (this.externalSql()) return this.externalSql()!;
    // ... lógica de generación normal ...
    return '-- Generando SQL...';
  }

  openSqlModal() { this.sqlModalOpen.set(true); }
  closeSqlModal() { this.sqlModalOpen.set(false); }
  openTableModal() { this.tableModalOpen.set(true); }
  closeTableModal() { this.tableModalOpen.set(false); }
  removeConnection(id: string) { this.connections.update(l => l.filter(c => c.id !== id)); }
  startConnectMode() { this.connectingFromId.set(this.selectedId()); }
  clearConnectMode() { this.connectingFromId.set(null); }

  // Métodos de conexión faltantes
  addConnection(fromId: string, toId: string) {
    const connection: Connection = {
      id: 'conn-' + Date.now() + '-' + Math.random(),
      fromId,
      toId
    };
    this.connections.update(list => [...list, connection]);
    this.notifications.success('Conexión creada');
  }

  connectToShape(shapeId: string): boolean {
    const fromId = this.connectingFromId();
    if (!fromId || fromId === shapeId) {
      this.clearConnectMode();
      return false;
    }

    // Verificar que no exista ya una conexión
    const existingConnection = this.connections().find(c => 
      (c.fromId === fromId && c.toId === shapeId) ||
      (c.fromId === shapeId && c.toId === fromId)
    );

    if (existingConnection) {
      this.notifications.warning('Ya existe una conexión entre estas formas');
      this.clearConnectMode();
      return false;
    }

    this.addConnection(fromId, shapeId);
    this.clearConnectMode();
    return true;
  }
}