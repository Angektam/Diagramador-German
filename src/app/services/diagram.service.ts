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
  private selectedIds = signal<string[]>([]); // Changed to array for multi-selection
  private connectingFromId = signal<string | null>(null);
  private zoom = signal(100);
  
  private externalSql = signal<string | null>(null);
  sqlModalOpen = signal(false);
  tableModalOpen = signal(false);
  templatesModalOpen = signal(false);

  readonly shapesList = this.shapes.asReadonly();
  readonly connectionsList = this.connections.asReadonly();
  readonly selectedShapeIds = this.selectedIds.asReadonly(); // Expose as array
  readonly selectedShapeId = computed(() => this.selectedIds()[0] ?? null); // Backward compatibility
  readonly connectingFromShapeId = this.connectingFromId.asReadonly();
  readonly zoomLevel = this.zoom.asReadonly();

  readonly selectedShape = computed(() => {
    const ids = this.selectedIds();
    return ids.length === 1 ? this.shapes().find(s => s.id === ids[0]) ?? null : null;
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
    if (this.selectedIds().includes(id)) {
      this.selectedIds.update(ids => ids.filter(i => i !== id));
    }
  }

  selectShape(id: string | null) { 
    if (id === null) {
      this.selectedIds.set([]);
    } else {
      this.selectedIds.set([id]); 
    }
  }
  
  // Multi-selection methods
  toggleShapeSelection(id: string) {
    this.selectedIds.update(ids => {
      if (ids.includes(id)) {
        return ids.filter(i => i !== id);
      } else {
        return [...ids, id];
      }
    });
  }
  
  selectAllShapes() {
    this.selectedIds.set(this.shapes().map(s => s.id));
  }
  
  clearSelection() {
    this.selectedIds.set([]);
  }
  
  deleteSelectedShapes() {
    const ids = this.selectedIds();
    ids.forEach(id => this.removeShape(id));
    this.selectedIds.set([]);
  }
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
      
      // Validar que tenga la estructura correcta
      if (!data || typeof data !== 'object') {
        this.notifications.error('El archivo JSON no tiene el formato correcto');
        return;
      }
      
      // Cargar los datos
      this.shapes.set(data.shapes || []);
      this.connections.set(data.connections || []);
      this.zoom.set(data.zoom || 100);
      this.externalSql.set(null); // Limpiar SQL externo
      
      // Mostrar información de lo que se cargó
      const shapeCount = (data.shapes || []).length;
      const connCount = (data.connections || []).length;
      
      if (shapeCount === 0) {
        this.notifications.warning('El diagrama está vacío');
      } else {
        this.notifications.success(`Diagrama cargado: ${shapeCount} forma(s), ${connCount} conexión(es)`);
      }
    } catch (e) { 
      this.notifications.error('Error al parsear el archivo JSON');
      console.error('JSON parse error:', e);
    }
  }

  loadExternalSql(sql: string) {
    this.externalSql.set(sql);
    
    console.log('=== INICIO IMPORTACIÓN SQL ===');
    console.log('SQL original (primeros 500 chars):', sql.substring(0, 500));
    
    // Limpiar el SQL: remover comentarios y normalizar espacios
    const cleanSql = sql
      .replace(/--.*$/gm, '') // Remover comentarios de línea
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios de bloque
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
    
    console.log('SQL limpio (primeros 500 chars):', cleanSql.substring(0, 500));
    
    // Regex mejorado para capturar CREATE TABLE completo
    // Captura todo hasta encontrar ); o ) seguido de ; o fin de línea
    const tableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:`)?([a-zA-Z0-9_]+)(?:`)?\s*\(((?:[^()]|\([^)]*\))*)\)\s*;?/gi;
    let match;
    const newShapes: DiagramShape[] = [];
    const foreignKeys: { fromTable: string; fromColumn: string; toTable: string; toColumn: string }[] = [];
    let px = 50, py = 50;
    let tablesFound = 0;

    while ((match = tableRegex.exec(cleanSql)) !== null) {
      tablesFound++;
      const tableName = match[1];
      const columnsText = match[2];
      
      console.log(`\n--- Tabla ${tablesFound}: ${tableName} ---`);
      console.log('Contenido de columnas (completo):', columnsText);
      console.log('Longitud:', columnsText.length, 'caracteres');
      
      // Dividir columnas de forma más inteligente
      const colLines = columnsText
        .split(/,(?![^()]*\))/) // Split por comas que no estén dentro de paréntesis
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      console.log('Total líneas encontradas:', colLines.length);
      
      console.log('Total líneas encontradas:', colLines.length);
      colLines.forEach((line, idx) => {
        console.log(`  Línea ${idx + 1}:`, line.substring(0, 80));
      });
      
      const columns = colLines
        .map(line => {
          // Limpiar la línea
          const cleanLine = line.trim();
          
          // Detectar FOREIGN KEY en formato: FOREIGN KEY (columna) REFERENCES tabla(columna)
          const fkMatch = /FOREIGN\s+KEY\s*\(\s*(?:`)?([a-zA-Z0-9_]+)(?:`)?\s*\)\s*REFERENCES\s+(?:`)?([a-zA-Z0-9_]+)(?:`)?\s*\(\s*(?:`)?([a-zA-Z0-9_]+)(?:`)?\s*\)/i.exec(cleanLine);
          if (fkMatch) {
            console.log('FK detectada (constraint):', {
              from: tableName + '.' + fkMatch[1],
              to: fkMatch[2] + '.' + fkMatch[3]
            });
            foreignKeys.push({
              fromTable: tableName,
              fromColumn: fkMatch[1],
              toTable: fkMatch[2],
              toColumn: fkMatch[3]
            });
            return null; // No agregar como columna
          }
          
          // Ignorar otros constraints
          if (/^(PRIMARY\s+KEY|CONSTRAINT|UNIQUE|CHECK|INDEX|KEY)\s*\(/i.test(cleanLine)) {
            console.log('Ignorando constraint:', cleanLine.substring(0, 50));
            return null;
          }
          
          // Extraer nombre y tipo de columna
          const parts = cleanLine.split(/\s+/);
          if (parts.length < 2) {
            console.log('Línea inválida (muy corta):', cleanLine);
            return null;
          }
          
          const colName = parts[0].replace(/[`'"]/g, ''); // Remover comillas
          const colType = parts[1].replace(/[`'"]/g, '').toUpperCase();
          
          // Detectar si es PRIMARY KEY
          const isPK = /PRIMARY\s+KEY/i.test(cleanLine) || /\bPK\b/i.test(cleanLine);
          
          // Detectar REFERENCES en la misma línea de la columna
          const refMatch = /REFERENCES\s+(?:`)?([a-zA-Z0-9_]+)(?:`)?\s*\(\s*(?:`)?([a-zA-Z0-9_]+)(?:`)?\s*\)/i.exec(cleanLine);
          if (refMatch) {
            console.log('FK detectada (inline):', {
              from: tableName + '.' + colName,
              to: refMatch[1] + '.' + refMatch[2]
            });
            foreignKeys.push({
              fromTable: tableName,
              fromColumn: colName,
              toTable: refMatch[1],
              toColumn: refMatch[2]
            });
          }
          
          return { 
            name: colName, 
            type: colType, 
            pk: isPK,
            fk: refMatch ? refMatch[1] : undefined
          };
        })
        .filter(col => col !== null) as any[];

      console.log('Columnas procesadas:', columns);

      if (columns.length > 0) {
        const shapeId = 't-' + tableName + '-' + Date.now();
        newShapes.push({
          id: shapeId,
          type: 'table',
          x: px,
          y: py,
          width: 200,
          height: Math.max(150, 80 + columns.length * 25),
          tableData: { name: tableName, columns: columns }
        });
        
        console.log('Forma creada:', { id: shapeId, name: tableName });
        
        px += 250;
        if (px > 800) {
          px = 50;
          py += 200;
        }
      }
    }

    console.log('\n=== RESUMEN ===');
    console.log('Total tablas encontradas:', newShapes.length);
    console.log('Nombres de tablas:', newShapes.map(s => s.tableData?.name));
    console.log('Total FKs detectadas:', foreignKeys.length);
    console.log('Detalle de FKs:', foreignKeys);

    if (newShapes.length > 0) {
      // Primero establecer las formas
      this.shapes.set(newShapes);
      
      // Crear conexiones basadas en las foreign keys detectadas
      const newConnections: Connection[] = [];
      const processedConnections = new Set<string>(); // Para evitar duplicados
      
      foreignKeys.forEach(fk => {
        console.log(`\nBuscando conexión para FK: ${fk.fromTable}.${fk.fromColumn} -> ${fk.toTable}.${fk.toColumn}`);
        
        // Buscar por nombre de tabla (case-insensitive)
        const fromShape = newShapes.find(s => 
          s.tableData?.name?.toLowerCase() === fk.fromTable.toLowerCase()
        );
        const toShape = newShapes.find(s => 
          s.tableData?.name?.toLowerCase() === fk.toTable.toLowerCase()
        );
        
        console.log('Forma origen encontrada:', fromShape ? fromShape.id : 'NO ENCONTRADA');
        console.log('Forma destino encontrada:', toShape ? toShape.id : 'NO ENCONTRADA');
        
        if (fromShape && toShape) {
          // Crear clave única para evitar duplicados
          const connKey = `${fromShape.id}-${toShape.id}`;
          const connKeyReverse = `${toShape.id}-${fromShape.id}`;
          
          if (!processedConnections.has(connKey) && !processedConnections.has(connKeyReverse)) {
            const connId = 'conn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            newConnections.push({
              id: connId,
              fromId: fromShape.id,
              toId: toShape.id
            });
            processedConnections.add(connKey);
            console.log('Conexión creada:', connId, fromShape.id, '->', toShape.id);
          } else {
            console.log('Conexión duplicada ignorada');
          }
        } else {
          console.warn('No se pudo crear conexión - tabla no encontrada');
          if (!fromShape) console.warn(`  Tabla origen "${fk.fromTable}" no existe`);
          if (!toShape) console.warn(`  Tabla destino "${fk.toTable}" no existe`);
        }
      });
      
      console.log('\n=== CONEXIONES FINALES ===');
      console.log('Total conexiones creadas:', newConnections.length);
      console.log('Detalle:', newConnections);
      
      // Establecer las conexiones
      this.connections.set(newConnections);
      
      // Mensaje de éxito
      const connMsg = newConnections.length > 0 ? `, ${newConnections.length} relación(es)` : '';
      this.notifications.success(`SQL importado: ${newShapes.length} tabla(s)${connMsg}`);
      
      // Si no se detectaron conexiones pero hay FKs, mostrar advertencia
      if (foreignKeys.length > 0 && newConnections.length === 0) {
        this.notifications.warning('Se detectaron claves foráneas pero no se pudieron crear las conexiones. Verifica los nombres de las tablas.');
      }
    } else {
      this.sqlModalOpen.set(true);
      this.notifications.warning('No se detectaron tablas CREATE TABLE. Mostrando SQL en el editor.');
      console.log('No se encontraron tablas en el SQL');
    }
    
    console.log('=== FIN IMPORTACIÓN SQL ===\n');
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
  openTemplatesModal() { this.templatesModalOpen.set(true); }
  closeTemplatesModal() { this.templatesModalOpen.set(false); }
  removeConnection(id: string) { this.connections.update(l => l.filter(c => c.id !== id)); }
  startConnectMode() { 
    const selectedId = this.selectedIds()[0];
    this.connectingFromId.set(selectedId ?? null); 
  }
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