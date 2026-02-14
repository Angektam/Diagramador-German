# Mejoras Sugeridas - Diagramador SQL

## Índice
1. [Funcionalidades Nuevas](#funcionalidades-nuevas)
2. [Mejoras de UX/UI](#mejoras-de-uxui)
3. [Performance y Optimización](#performance-y-optimización)
4. [Colaboración](#colaboración)
5. [Exportación e Importación](#exportación-e-importación)
6. [Inteligencia Artificial](#inteligencia-artificial)
7. [Accesibilidad](#accesibilidad)
8. [Seguridad](#seguridad)
9. [Integración](#integración)
10. [Priorización](#priorización)

---

## Funcionalidades Nuevas

### 1. Edición de Texto Inline
**Descripción**: Editar nombres de tablas y columnas directamente en el canvas sin abrir modales.

**Implementación**:
```typescript
// Doble-click en texto para editar
onTextDoubleClick(shape: DiagramShape, field: 'name' | 'column') {
  // Crear input temporal sobre el texto
  const input = document.createElement('input');
  input.value = getCurrentValue(shape, field);
  input.style.position = 'absolute';
  input.style.left = `${shape.x}px`;
  input.style.top = `${shape.y}px`;
  
  // Al perder foco, guardar cambios
  input.onblur = () => {
    updateShapeText(shape.id, field, input.value);
    input.remove();
  };
  
  canvas.appendChild(input);
  input.focus();
  input.select();
}
```

**Beneficios**:
- Edición más rápida
- Menos clicks
- Flujo de trabajo más natural

**Prioridad**: Alta 🔴

---

### 2. Deshacer/Rehacer (Undo/Redo)
**Descripción**: Historial de acciones con Ctrl+Z y Ctrl+Y.

**Implementación**:
```typescript
class HistoryService {
  private history: DiagramState[] = [];
  private currentIndex = -1;
  private maxHistory = 50;
  
  saveState(state: DiagramState) {
    // Eliminar estados futuros si estamos en medio del historial
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Agregar nuevo estado
    this.history.push(cloneDeep(state));
    this.currentIndex++;
    
    // Limitar tamaño del historial
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }
  
  undo(): DiagramState | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }
  
  redo(): DiagramState | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }
}
```

**Acciones a Trackear**:
- Agregar/eliminar formas
- Mover formas
- Editar propiedades
- Crear/eliminar conexiones
- Cambiar zoom

**Prioridad**: Alta 🔴

---

### 3. Auto-Layout (Organización Automática)
**Descripción**: Algoritmo para organizar formas automáticamente de manera óptima.

**Algoritmos Sugeridos**:

#### Hierarchical Layout
```typescript
function hierarchicalLayout(shapes: DiagramShape[], connections: Connection[]) {
  // 1. Detectar niveles jerárquicos
  const levels = detectLevels(shapes, connections);
  
  // 2. Posicionar por niveles
  levels.forEach((level, index) => {
    const y = 100 + (index * 250);
    const spacing = canvasWidth / (level.length + 1);
    
    level.forEach((shape, i) => {
      shape.x = spacing * (i + 1) - shape.width / 2;
      shape.y = y;
    });
  });
  
  return shapes;
}
```

#### Force-Directed Layout
```typescript
function forceDirectedLayout(shapes: DiagramShape[], connections: Connection[]) {
  const iterations = 100;
  const repulsion = 5000;
  const attraction = 0.1;
  
  for (let i = 0; i < iterations; i++) {
    // Repulsión entre todas las formas
    shapes.forEach(shape1 => {
      shapes.forEach(shape2 => {
        if (shape1.id !== shape2.id) {
          const dx = shape2.x - shape1.x;
          const dy = shape2.y - shape1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const force = repulsion / (distance * distance);
            shape1.x -= (dx / distance) * force;
            shape1.y -= (dy / distance) * force;
          }
        }
      });
    });
    
    // Atracción entre formas conectadas
    connections.forEach(conn => {
      const from = shapes.find(s => s.id === conn.fromId);
      const to = shapes.find(s => s.id === conn.toId);
      
      if (from && to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        from.x += dx * attraction;
        from.y += dy * attraction;
        to.x -= dx * attraction;
        to.y -= dy * attraction;
      }
    });
  }
  
  return shapes;
}
```

**Prioridad**: Media 🟡

---

### 4. Búsqueda y Filtrado
**Descripción**: Buscar tablas/formas por nombre y filtrar por tipo.

**Implementación**:
```typescript
@Component({
  template: `
    <div class="search-bar">
      <input type="text" 
             [(ngModel)]="searchQuery"
             (input)="onSearch()"
             placeholder="Buscar tablas...">
      
      <select [(ngModel)]="filterType" (change)="onFilter()">
        <option value="">Todos</option>
        <option value="table">Tablas</option>
        <option value="view">Vistas</option>
        <option value="procedure">Procedimientos</option>
      </select>
    </div>
  `
})
class SearchComponent {
  searchQuery = '';
  filterType = '';
  
  onSearch() {
    const query = this.searchQuery.toLowerCase();
    const shapes = this.diagram.shapesList();
    
    const matches = shapes.filter(shape => {
      const name = shape.tableData?.name || shape.text || '';
      return name.toLowerCase().includes(query);
    });
    
    // Highlight matches
    this.diagram.clearSelection();
    matches.forEach(shape => {
      this.diagram.toggleShapeSelection(shape.id);
    });
    
    // Centrar en primer resultado
    if (matches.length > 0) {
      this.centerOnShape(matches[0]);
    }
  }
  
  onFilter() {
    const shapes = this.diagram.shapesList();
    const filtered = this.filterType 
      ? shapes.filter(s => s.type === this.filterType)
      : shapes;
    
    // Mostrar solo filtradas
    this.diagram.setVisibleShapes(filtered.map(s => s.id));
  }
}
```

**Prioridad**: Media 🟡

---


### 5. Exportación a Imágenes
**Descripción**: Exportar diagramas como PNG, SVG o PDF.

**Implementación PNG**:
```typescript
async exportToPNG() {
  const svg = document.querySelector('.canvas-svg') as SVGElement;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Calcular bounds del diagrama
  const bounds = this.calculateBounds();
  canvas.width = bounds.width + 100; // padding
  canvas.height = bounds.height + 100;
  
  // Convertir SVG a imagen
  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  img.onload = () => {
    ctx.drawImage(img, 50, 50);
    
    // Descargar
    canvas.toBlob(blob => {
      const link = document.createElement('a');
      link.download = 'diagrama.png';
      link.href = URL.createObjectURL(blob);
      link.click();
    });
  };
  
  img.src = url;
}
```

**Formatos**:
- PNG: Raster, buena calidad
- SVG: Vectorial, escalable
- PDF: Profesional, imprimible

**Prioridad**: Alta 🔴

---

### 6. Temas (Dark Mode)
**Descripción**: Modo oscuro y temas personalizables.

**Implementación**:
```typescript
// themes.ts
export const themes = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8f9fa',
    '--text-primary': '#1a1a1a',
    '--text-secondary': '#6c757d',
    '--accent': '#6366f1',
    '--border': '#dee2e6',
    '--canvas-bg': '#ffffff',
    '--grid-color': 'rgba(100, 116, 139, 0.4)'
  },
  dark: {
    '--bg-primary': '#1a1a1a',
    '--bg-secondary': '#2d2d2d',
    '--text-primary': '#ffffff',
    '--text-secondary': '#a0a0a0',
    '--accent': '#818cf8',
    '--border': '#404040',
    '--canvas-bg': '#0a0a0a',
    '--grid-color': 'rgba(255, 255, 255, 0.1)'
  }
};

// theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  currentTheme = signal<'light' | 'dark'>('light');
  
  setTheme(theme: 'light' | 'dark') {
    this.currentTheme.set(theme);
    const root = document.documentElement;
    
    Object.entries(themes[theme]).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    localStorage.setItem('theme', theme);
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}
```

**Prioridad**: Media 🟡

---

### 7. Comentarios y Anotaciones
**Descripción**: Agregar notas y comentarios a formas y conexiones.

**Implementación**:
```typescript
interface Annotation {
  id: string;
  shapeId: string;
  text: string;
  position: { x: number; y: number };
  author: string;
  timestamp: Date;
  resolved: boolean;
}

@Component({
  template: `
    <div class="annotation" 
         [style.left.px]="annotation.position.x"
         [style.top.px]="annotation.position.y">
      <div class="annotation-header">
        <span class="author">{{ annotation.author }}</span>
        <span class="time">{{ formatTime(annotation.timestamp) }}</span>
      </div>
      <div class="annotation-text">{{ annotation.text }}</div>
      <button (click)="resolve(annotation.id)">Resolver</button>
    </div>
  `
})
class AnnotationComponent {
  // ...
}
```

**Prioridad**: Baja 🟢

---

## Mejoras de UX/UI

### 1. Tooltips Informativos
**Descripción**: Mostrar información al pasar el mouse sobre formas.

**Implementación**:
```typescript
<g class="diagram-shape" 
   (mouseenter)="showTooltip($event, shape)"
   (mouseleave)="hideTooltip()">
  <!-- forma -->
</g>

<div class="tooltip" 
     *ngIf="tooltipVisible"
     [style.left.px]="tooltipX"
     [style.top.px]="tooltipY">
  <div class="tooltip-title">{{ shape.tableData?.name }}</div>
  <div class="tooltip-info">
    <div>Columnas: {{ shape.tableData?.columns.length }}</div>
    <div>Conexiones: {{ getConnectionCount(shape.id) }}</div>
    <div>Tipo: {{ shape.type }}</div>
  </div>
</div>
```

**Prioridad**: Media 🟡

---

### 2. Menú Contextual (Right-Click)
**Descripción**: Menú con acciones al hacer click derecho en formas.

**Implementación**:
```typescript
<div class="context-menu" 
     *ngIf="contextMenuVisible"
     [style.left.px]="contextMenuX"
     [style.top.px]="contextMenuY">
  <button (click)="editShape()">✏️ Editar</button>
  <button (click)="duplicateShape()">📋 Duplicar</button>
  <button (click)="copyShape()">📄 Copiar</button>
  <button (click)="deleteShape()">🗑️ Eliminar</button>
  <hr>
  <button (click)="bringToFront()">⬆️ Traer al frente</button>
  <button (click)="sendToBack()">⬇️ Enviar atrás</button>
  <hr>
  <button (click)="changeColor()">🎨 Cambiar color</button>
  <button (click)="addComment()">💬 Agregar comentario</button>
</div>
```

**Prioridad**: Alta 🔴

---

### 3. Atajos de Teclado Personalizables
**Descripción**: Permitir al usuario configurar sus propios atajos.

**Implementación**:
```typescript
interface KeyBinding {
  action: string;
  keys: string[];
  description: string;
}

const defaultBindings: KeyBinding[] = [
  { action: 'copy', keys: ['Ctrl', 'C'], description: 'Copiar' },
  { action: 'paste', keys: ['Ctrl', 'V'], description: 'Pegar' },
  { action: 'undo', keys: ['Ctrl', 'Z'], description: 'Deshacer' },
  // ...
];

@Injectable({ providedIn: 'root' })
export class KeyBindingService {
  bindings = signal(defaultBindings);
  
  setBinding(action: string, keys: string[]) {
    const binding = this.bindings().find(b => b.action === action);
    if (binding) {
      binding.keys = keys;
      this.saveBindings();
    }
  }
  
  handleKeyPress(event: KeyboardEvent): string | null {
    const pressed = [];
    if (event.ctrlKey) pressed.push('Ctrl');
    if (event.shiftKey) pressed.push('Shift');
    if (event.altKey) pressed.push('Alt');
    pressed.push(event.key);
    
    const binding = this.bindings().find(b => 
      JSON.stringify(b.keys) === JSON.stringify(pressed)
    );
    
    return binding?.action || null;
  }
}
```

**Prioridad**: Baja 🟢

---

### 4. Animaciones Suaves
**Descripción**: Transiciones animadas para mejor feedback visual.

**Implementación**:
```css
/* Animación al agregar forma */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.diagram-shape {
  animation: fadeInScale 0.3s ease-out;
}

/* Animación al seleccionar */
.diagram-shape.selected {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Animación al eliminar */
@keyframes fadeOutScale {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}
```

**Prioridad**: Baja 🟢

---

### 5. Onboarding Tutorial
**Descripción**: Tutorial interactivo para nuevos usuarios.

**Implementación**:
```typescript
interface TutorialStep {
  target: string;
  title: string;
  description: string;
  action?: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    target: '.shapes-panel',
    title: '¡Bienvenido! 👋',
    description: 'Arrastra formas desde aquí al canvas para crear tu diagrama.'
  },
  {
    target: '.toolbar',
    title: 'Barra de herramientas',
    description: 'Aquí encontrarás acciones como guardar, importar SQL y más.'
  },
  {
    target: '.canvas-wrapper',
    title: 'Canvas',
    description: 'Área de trabajo. Usa Ctrl+Wheel para zoom y click derecho para mover.'
  },
  {
    target: '.minimap',
    title: 'Minimapa',
    description: 'Vista general del diagrama. Click para navegar rápidamente.'
  }
];

@Component({
  template: `
    <div class="tutorial-overlay" *ngIf="showTutorial">
      <div class="tutorial-spotlight" [style]="getSpotlightStyle()"></div>
      <div class="tutorial-card" [style]="getCardStyle()">
        <h3>{{ currentStep.title }}</h3>
        <p>{{ currentStep.description }}</p>
        <div class="tutorial-actions">
          <button (click)="skipTutorial()">Saltar</button>
          <button (click)="nextStep()">
            {{ isLastStep ? 'Finalizar' : 'Siguiente' }}
          </button>
        </div>
        <div class="tutorial-progress">
          {{ currentStepIndex + 1 }} / {{ tutorialSteps.length }}
        </div>
      </div>
    </div>
  `
})
class TutorialComponent {
  // ...
}
```

**Prioridad**: Media 🟡

---


## Performance y Optimización

### 1. Virtualización del Canvas
**Descripción**: Renderizar solo formas visibles en el viewport.

**Implementación**:
```typescript
@Component({
  selector: 'app-canvas'
})
export class CanvasComponent {
  visibleShapes = computed(() => {
    const shapes = this.diagram.shapesList();
    const viewport = this.getViewport();
    
    return shapes.filter(shape => 
      this.isInViewport(shape, viewport)
    );
  });
  
  private isInViewport(shape: DiagramShape, viewport: Viewport): boolean {
    return !(
      shape.x + shape.width < viewport.x ||
      shape.x > viewport.x + viewport.width ||
      shape.y + shape.height < viewport.y ||
      shape.y > viewport.y + viewport.height
    );
  }
  
  private getViewport(): Viewport {
    const wrapper = this.wrapperRef.nativeElement;
    const zoom = this.diagram.zoomLevel() / 100;
    
    return {
      x: wrapper.scrollLeft / zoom,
      y: wrapper.scrollTop / zoom,
      width: wrapper.clientWidth / zoom,
      height: wrapper.clientHeight / zoom
    };
  }
}
```

**Beneficios**:
- Mejor performance con muchas formas
- Menor uso de memoria
- Scroll más fluido

**Prioridad**: Media 🟡

---

### 2. Web Workers para Procesamiento
**Descripción**: Procesar operaciones pesadas en background threads.

**Implementación**:
```typescript
// sql-parser.worker.ts
self.addEventListener('message', (e) => {
  const { sql } = e.data;
  
  // Procesamiento pesado
  const tables = parseSQLTables(sql);
  const connections = detectConnections(tables);
  
  self.postMessage({ tables, connections });
});

// Uso en componente
async importSQL(sql: string) {
  const worker = new Worker(new URL('./sql-parser.worker', import.meta.url));
  
  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      const { tables, connections } = e.data;
      this.createShapesFromTables(tables);
      this.createConnections(connections);
      worker.terminate();
      resolve(true);
    };
    
    worker.postMessage({ sql });
  });
}
```

**Operaciones a Optimizar**:
- Parsing de SQL
- Auto-layout
- Exportación de imágenes
- Búsqueda en diagramas grandes

**Prioridad**: Baja 🟢

---

### 3. Lazy Loading de Componentes
**Descripción**: Cargar componentes solo cuando se necesitan.

**Implementación**:
```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'editor',
    loadComponent: () => import('./components/editor/editor.component')
      .then(m => m.EditorComponent),
    canActivate: [authGuard]
  }
];

// Modales lazy
async openTemplatesModal() {
  const { TemplatesModalComponent } = await import(
    './components/templates-modal/templates-modal.component'
  );
  
  // Mostrar modal...
}
```

**Beneficios**:
- Carga inicial más rápida
- Menor bundle size
- Mejor Time to Interactive

**Prioridad**: Media 🟡

---

### 4. Caché de Diagramas
**Descripción**: Cachear diagramas frecuentes en memoria.

**Implementación**:
```typescript
@Injectable({ providedIn: 'root' })
export class DiagramCacheService {
  private cache = new Map<string, DiagramState>();
  private maxCacheSize = 10;
  private accessOrder: string[] = [];
  
  get(id: string): DiagramState | null {
    const diagram = this.cache.get(id);
    
    if (diagram) {
      // Actualizar orden de acceso (LRU)
      this.accessOrder = this.accessOrder.filter(i => i !== id);
      this.accessOrder.push(id);
    }
    
    return diagram || null;
  }
  
  set(id: string, diagram: DiagramState) {
    // Si el caché está lleno, eliminar el menos usado
    if (this.cache.size >= this.maxCacheSize) {
      const leastUsed = this.accessOrder.shift();
      if (leastUsed) {
        this.cache.delete(leastUsed);
      }
    }
    
    this.cache.set(id, diagram);
    this.accessOrder.push(id);
  }
  
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }
}
```

**Prioridad**: Baja 🟢

---

## Colaboración

### 1. Colaboración en Tiempo Real
**Descripción**: Múltiples usuarios editando el mismo diagrama simultáneamente.

**Tecnologías**:
- WebSockets (Socket.io)
- Firebase Realtime Database
- Supabase Realtime

**Implementación con WebSockets**:
```typescript
@Injectable({ providedIn: 'root' })
export class CollaborationService {
  private socket: Socket;
  private roomId: string;
  
  connect(diagramId: string) {
    this.socket = io('wss://api.diagramador.com');
    this.roomId = `diagram-${diagramId}`;
    
    this.socket.emit('join-room', this.roomId);
    
    // Escuchar cambios de otros usuarios
    this.socket.on('shape-added', (shape) => {
      this.diagramService.addShape(shape, { skipBroadcast: true });
    });
    
    this.socket.on('shape-updated', ({ id, updates }) => {
      this.diagramService.updateShape(id, updates, { skipBroadcast: true });
    });
    
    this.socket.on('shape-deleted', (id) => {
      this.diagramService.deleteShape(id, { skipBroadcast: true });
    });
  }
  
  broadcastShapeAdded(shape: DiagramShape) {
    this.socket.emit('shape-added', { room: this.roomId, shape });
  }
  
  broadcastShapeUpdated(id: string, updates: Partial<DiagramShape>) {
    this.socket.emit('shape-updated', { room: this.roomId, id, updates });
  }
  
  disconnect() {
    this.socket.emit('leave-room', this.roomId);
    this.socket.disconnect();
  }
}
```

**Características**:
- Cursores de otros usuarios en tiempo real
- Indicador de quién está editando qué
- Chat integrado
- Historial de cambios
- Resolución de conflictos

**Prioridad**: Alta 🔴

---

### 2. Comentarios y Revisiones
**Descripción**: Sistema de comentarios para revisión de diagramas.

**Implementación**:
```typescript
interface Comment {
  id: string;
  diagramId: string;
  shapeId?: string;
  author: User;
  text: string;
  timestamp: Date;
  resolved: boolean;
  replies: Comment[];
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  comments = signal<Comment[]>([]);
  
  addComment(comment: Omit<Comment, 'id' | 'timestamp'>) {
    const newComment: Comment = {
      ...comment,
      id: generateId(),
      timestamp: new Date(),
      replies: []
    };
    
    this.comments.update(comments => [...comments, newComment]);
    this.saveToBackend(newComment);
  }
  
  replyToComment(commentId: string, reply: string) {
    this.comments.update(comments => 
      comments.map(c => 
        c.id === commentId 
          ? { ...c, replies: [...c.replies, createReply(reply)] }
          : c
      )
    );
  }
  
  resolveComment(commentId: string) {
    this.comments.update(comments =>
      comments.map(c =>
        c.id === commentId ? { ...c, resolved: true } : c
      )
    );
  }
}
```

**Prioridad**: Media 🟡

---

### 3. Control de Versiones
**Descripción**: Historial de versiones con posibilidad de restaurar.

**Implementación**:
```typescript
interface Version {
  id: string;
  diagramId: string;
  version: number;
  state: DiagramState;
  author: User;
  timestamp: Date;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class VersionControlService {
  versions = signal<Version[]>([]);
  
  createVersion(message: string) {
    const currentState = this.diagramService.getState();
    const version: Version = {
      id: generateId(),
      diagramId: this.currentDiagramId,
      version: this.versions().length + 1,
      state: cloneDeep(currentState),
      author: this.authService.currentUser(),
      timestamp: new Date(),
      message
    };
    
    this.versions.update(v => [...v, version]);
    this.saveToBackend(version);
  }
  
  restoreVersion(versionId: string) {
    const version = this.versions().find(v => v.id === versionId);
    if (version) {
      this.diagramService.setState(version.state);
      this.notifications.success(`Restaurado a versión ${version.version}`);
    }
  }
  
  compareVersions(v1Id: string, v2Id: string) {
    const v1 = this.versions().find(v => v.id === v1Id);
    const v2 = this.versions().find(v => v.id === v2Id);
    
    if (v1 && v2) {
      return this.calculateDiff(v1.state, v2.state);
    }
    
    return null;
  }
}
```

**Prioridad**: Media 🟡

---


## Exportación e Importación

### 1. Importar desde Bases de Datos Reales
**Descripción**: Conectar a BD existentes y generar diagramas automáticamente.

**Implementación**:
```typescript
interface DatabaseConnection {
  type: 'mysql' | 'postgresql' | 'sqlserver' | 'oracle';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class DatabaseImportService {
  async importFromDatabase(connection: DatabaseConnection) {
    // Conectar a la BD (requiere backend)
    const response = await fetch('/api/import-database', {
      method: 'POST',
      body: JSON.stringify(connection)
    });
    
    const { tables, relationships } = await response.json();
    
    // Generar diagrama
    this.generateDiagramFromSchema(tables, relationships);
  }
  
  private generateDiagramFromSchema(tables: any[], relationships: any[]) {
    // Crear formas para cada tabla
    tables.forEach((table, index) => {
      const shape = this.createTableShape(table, index);
      this.diagramService.addShape(shape);
    });
    
    // Crear conexiones
    relationships.forEach(rel => {
      this.diagramService.addConnection(rel.fromTable, rel.toTable);
    });
  }
}
```

**Bases de Datos Soportadas**:
- MySQL / MariaDB
- PostgreSQL
- SQL Server
- Oracle
- SQLite

**Prioridad**: Alta 🔴

---

### 2. Exportar a Diferentes Dialectos SQL
**Descripción**: Generar SQL específico para cada motor de BD.

**Implementación**:
```typescript
interface SQLDialect {
  name: string;
  dataTypes: Map<string, string>;
  syntax: {
    autoIncrement: string;
    primaryKey: string;
    foreignKey: string;
  };
}

const dialects: Record<string, SQLDialect> = {
  mysql: {
    name: 'MySQL',
    dataTypes: new Map([
      ['INT', 'INT'],
      ['VARCHAR', 'VARCHAR'],
      ['TEXT', 'TEXT'],
      ['DATETIME', 'DATETIME']
    ]),
    syntax: {
      autoIncrement: 'AUTO_INCREMENT',
      primaryKey: 'PRIMARY KEY',
      foreignKey: 'FOREIGN KEY'
    }
  },
  postgresql: {
    name: 'PostgreSQL',
    dataTypes: new Map([
      ['INT', 'INTEGER'],
      ['VARCHAR', 'VARCHAR'],
      ['TEXT', 'TEXT'],
      ['DATETIME', 'TIMESTAMP']
    ]),
    syntax: {
      autoIncrement: 'SERIAL',
      primaryKey: 'PRIMARY KEY',
      foreignKey: 'FOREIGN KEY'
    }
  },
  sqlserver: {
    name: 'SQL Server',
    dataTypes: new Map([
      ['INT', 'INT'],
      ['VARCHAR', 'NVARCHAR'],
      ['TEXT', 'NVARCHAR(MAX)'],
      ['DATETIME', 'DATETIME2']
    ]),
    syntax: {
      autoIncrement: 'IDENTITY(1,1)',
      primaryKey: 'PRIMARY KEY',
      foreignKey: 'FOREIGN KEY'
    }
  }
};

export class SQLExportService {
  exportToDialect(dialect: string): string {
    const config = dialects[dialect];
    const tables = this.diagramService.shapesList()
      .filter(s => s.type === 'table');
    
    let sql = `-- SQL para ${config.name}\n\n`;
    
    tables.forEach(table => {
      sql += this.generateCreateTable(table, config);
      sql += '\n\n';
    });
    
    return sql;
  }
  
  private generateCreateTable(table: DiagramShape, config: SQLDialect): string {
    let sql = `CREATE TABLE ${table.tableData.name} (\n`;
    
    const columns = table.tableData.columns.map(col => {
      const type = config.dataTypes.get(col.type) || col.type;
      let def = `  ${col.name} ${type}`;
      
      if (col.pk) {
        def += ` ${config.syntax.primaryKey}`;
        if (config.syntax.autoIncrement) {
          def += ` ${config.syntax.autoIncrement}`;
        }
      }
      
      return def;
    });
    
    sql += columns.join(',\n');
    sql += '\n);';
    
    return sql;
  }
}
```

**Prioridad**: Media 🟡

---

### 3. Importar desde Archivos
**Descripción**: Importar diagramas desde diferentes formatos.

**Formatos Soportados**:
- JSON (nativo)
- XML
- YAML
- draw.io
- Lucidchart
- dbdiagram.io

**Implementación**:
```typescript
@Injectable({ providedIn: 'root' })
export class FileImportService {
  async importFile(file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const content = await file.text();
    
    switch (extension) {
      case 'json':
        return this.importJSON(content);
      case 'xml':
        return this.importXML(content);
      case 'drawio':
        return this.importDrawIO(content);
      default:
        throw new Error('Formato no soportado');
    }
  }
  
  private importJSON(content: string) {
    const data = JSON.parse(content);
    this.diagramService.loadDiagram(data);
  }
  
  private importXML(content: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    
    // Parsear XML y convertir a formato interno
    const shapes = this.parseXMLShapes(doc);
    const connections = this.parseXMLConnections(doc);
    
    this.diagramService.loadDiagram({ shapes, connections });
  }
  
  private importDrawIO(content: string) {
    // Parsear formato draw.io (mxGraph XML)
    // ...
  }
}
```

**Prioridad**: Media 🟡

---

## Inteligencia Artificial

### 1. Generación con IA Avanzada
**Descripción**: Usar modelos de lenguaje para generar diagramas más inteligentes.

**Implementación con OpenAI**:
```typescript
@Injectable({ providedIn: 'root' })
export class AIAssistantService {
  private apiKey = environment.openaiApiKey;
  
  async generateDatabaseSchema(description: string) {
    const prompt = `
      Genera un esquema de base de datos SQL para: ${description}
      
      Incluye:
      - Tablas con nombres descriptivos
      - Columnas con tipos de datos apropiados
      - Primary keys
      - Foreign keys para relaciones
      - Índices sugeridos
      
      Formato de respuesta: JSON con estructura:
      {
        "tables": [
          {
            "name": "nombre_tabla",
            "columns": [
              { "name": "id", "type": "INT", "pk": true },
              { "name": "nombre", "type": "VARCHAR(100)" }
            ]
          }
        ],
        "relationships": [
          { "from": "tabla1", "to": "tabla2", "type": "1:N" }
        ]
      }
    `;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    const schema = JSON.parse(data.choices[0].message.content);
    
    return schema;
  }
  
  async optimizeSchema(currentSchema: DiagramState) {
    const prompt = `
      Analiza este esquema de base de datos y sugiere optimizaciones:
      ${JSON.stringify(currentSchema)}
      
      Considera:
      - Normalización (1NF, 2NF, 3NF)
      - Índices faltantes
      - Relaciones incorrectas
      - Tipos de datos subóptimos
      - Nombres poco descriptivos
    `;
    
    // Similar a generateDatabaseSchema
    // ...
  }
  
  async explainDiagram(diagram: DiagramState) {
    const prompt = `
      Explica este diagrama de base de datos en lenguaje natural:
      ${JSON.stringify(diagram)}
      
      Incluye:
      - Propósito general del sistema
      - Descripción de cada tabla
      - Relaciones entre tablas
      - Posibles casos de uso
    `;
    
    // ...
  }
}
```

**Características**:
- Generación inteligente de esquemas
- Sugerencias de optimización
- Detección de problemas de diseño
- Explicación de diagramas complejos
- Conversión de lenguaje natural a SQL

**Prioridad**: Alta 🔴

---

### 2. Autocompletado Inteligente
**Descripción**: Sugerencias contextuales al crear tablas y columnas.

**Implementación**:
```typescript
@Injectable({ providedIn: 'root' })
export class AutocompleteService {
  private commonColumns = {
    'id': { type: 'INT', pk: true, autoIncrement: true },
    'created_at': { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
    'updated_at': { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
    'deleted_at': { type: 'TIMESTAMP', nullable: true },
    'email': { type: 'VARCHAR(255)', unique: true },
    'password': { type: 'VARCHAR(255)' },
    'name': { type: 'VARCHAR(100)' },
    'description': { type: 'TEXT' },
    'status': { type: 'ENUM', values: ['active', 'inactive'] }
  };
  
  getSuggestions(tableName: string, columnName: string): ColumnSuggestion[] {
    const suggestions: ColumnSuggestion[] = [];
    
    // Sugerencias basadas en nombre de columna
    if (columnName.includes('id') && columnName !== 'id') {
      const referencedTable = columnName.replace('_id', '');
      suggestions.push({
        type: 'INT',
        fk: referencedTable,
        description: `Foreign key a tabla ${referencedTable}`
      });
    }
    
    if (columnName.includes('email')) {
      suggestions.push({
        type: 'VARCHAR(255)',
        unique: true,
        description: 'Email único'
      });
    }
    
    if (columnName.includes('date') || columnName.includes('at')) {
      suggestions.push({
        type: 'TIMESTAMP',
        description: 'Fecha y hora'
      });
    }
    
    // Sugerencias basadas en nombre de tabla
    if (tableName.toLowerCase().includes('user')) {
      suggestions.push(
        { name: 'email', ...this.commonColumns['email'] },
        { name: 'password', ...this.commonColumns['password'] }
      );
    }
    
    return suggestions;
  }
}
```

**Prioridad**: Media 🟡

---

### 3. Validación Automática de Esquemas
**Descripción**: IA que detecta problemas de diseño.

**Implementación**:
```typescript
interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  type: string;
  message: string;
  shapeId?: string;
  suggestion?: string;
}

@Injectable({ providedIn: 'root' })
export class SchemaValidationService {
  validateSchema(diagram: DiagramState): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // 1. Tablas sin primary key
    diagram.shapes.forEach(shape => {
      if (shape.type === 'table') {
        const hasPK = shape.tableData.columns.some(c => c.pk);
        if (!hasPK) {
          issues.push({
            severity: 'error',
            type: 'missing-primary-key',
            message: `Tabla "${shape.tableData.name}" no tiene primary key`,
            shapeId: shape.id,
            suggestion: 'Agrega una columna "id INT PRIMARY KEY AUTO_INCREMENT"'
          });
        }
      }
    });
    
    // 2. Nombres de tabla en plural
    diagram.shapes.forEach(shape => {
      if (shape.type === 'table') {
        const name = shape.tableData.name;
        if (!name.endsWith('s') && !name.endsWith('es')) {
          issues.push({
            severity: 'warning',
            type: 'naming-convention',
            message: `Tabla "${name}" debería estar en plural`,
            shapeId: shape.id,
            suggestion: `Renombrar a "${name}s"`
          });
        }
      }
    });
    
    // 3. Relaciones sin índice
    diagram.connections.forEach(conn => {
      const fromShape = diagram.shapes.find(s => s.id === conn.fromId);
      const toShape = diagram.shapes.find(s => s.id === conn.toId);
      
      if (fromShape && toShape) {
        const fkColumn = fromShape.tableData.columns.find(c => 
          c.fk === toShape.tableData.name
        );
        
        if (fkColumn && !fkColumn.indexed) {
          issues.push({
            severity: 'warning',
            type: 'missing-index',
            message: `Columna FK "${fkColumn.name}" debería tener índice`,
            shapeId: fromShape.id,
            suggestion: 'Agregar índice para mejorar performance'
          });
        }
      }
    });
    
    // 4. Tablas huérfanas (sin conexiones)
    diagram.shapes.forEach(shape => {
      if (shape.type === 'table') {
        const hasConnections = diagram.connections.some(c =>
          c.fromId === shape.id || c.toId === shape.id
        );
        
        if (!hasConnections && diagram.shapes.length > 1) {
          issues.push({
            severity: 'info',
            type: 'orphan-table',
            message: `Tabla "${shape.tableData.name}" no tiene relaciones`,
            shapeId: shape.id
          });
        }
      }
    });
    
    return issues;
  }
}
```

**Prioridad**: Media 🟡

---


## Accesibilidad

### 1. Navegación por Teclado Completa
**Descripción**: Permitir usar toda la aplicación sin mouse.

**Implementación**:
```typescript
@Component({
  selector: 'app-canvas'
})
export class CanvasComponent {
  @HostListener('keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    const selectedShapes = this.diagram.selectedShapeIds();
    
    if (selectedShapes.length === 0) return;
    
    // Mover formas con flechas
    if (event.key.startsWith('Arrow')) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1; // Shift para movimiento rápido
      
      selectedShapes.forEach(id => {
        const shape = this.diagram.getShape(id);
        if (!shape) return;
        
        let newX = shape.x;
        let newY = shape.y;
        
        switch (event.key) {
          case 'ArrowUp': newY -= step; break;
          case 'ArrowDown': newY += step; break;
          case 'ArrowLeft': newX -= step; break;
          case 'ArrowRight': newX += step; break;
        }
        
        this.diagram.updateShape(id, { x: newX, y: newY });
      });
    }
    
    // Tab para navegar entre formas
    if (event.key === 'Tab') {
      event.preventDefault();
      const shapes = this.diagram.shapesList();
      const currentIndex = shapes.findIndex(s => 
        selectedShapes.includes(s.id)
      );
      
      const nextIndex = event.shiftKey 
        ? (currentIndex - 1 + shapes.length) % shapes.length
        : (currentIndex + 1) % shapes.length;
      
      this.diagram.selectShape(shapes[nextIndex].id);
      this.centerOnShape(shapes[nextIndex]);
    }
  }
}
```

**Atajos Adicionales**:
- `Tab` / `Shift+Tab`: Navegar entre formas
- `Flechas`: Mover forma seleccionada
- `Shift+Flechas`: Mover 10px
- `Enter`: Editar forma seleccionada
- `Space`: Centrar forma en viewport
- `Home`: Ir a primera forma
- `End`: Ir a última forma

**Prioridad**: Media 🟡

---

### 2. Soporte para Lectores de Pantalla
**Descripción**: ARIA labels y descripciones para usuarios con discapacidad visual.

**Implementación**:
```html
<!-- Canvas -->
<main class="canvas-wrapper" 
      role="application"
      aria-label="Área de trabajo del diagrama"
      aria-describedby="canvas-instructions">
  
  <div id="canvas-instructions" class="sr-only">
    Usa las flechas del teclado para mover formas seleccionadas.
    Presiona Tab para navegar entre formas.
    Presiona Enter para editar una forma.
  </div>
  
  <!-- Formas -->
  <g class="diagram-shape"
     role="button"
     [attr.aria-label]="getShapeAriaLabel(shape)"
     [attr.aria-selected]="isSelected(shape.id)"
     tabindex="0">
    <!-- contenido -->
  </g>
</main>

<!-- Toolbar -->
<div class="toolbar" role="toolbar" aria-label="Barra de herramientas">
  <button aria-label="Nuevo diagrama" title="Nuevo diagrama">
    🏠
  </button>
  <button aria-label="Guardar diagrama" title="Guardar">
    💾
  </button>
</div>
```

```typescript
getShapeAriaLabel(shape: DiagramShape): string {
  if (shape.type === 'table') {
    const columnCount = shape.tableData.columns.length;
    return `Tabla ${shape.tableData.name} con ${columnCount} columnas`;
  }
  
  return `Forma ${shape.type}: ${shape.text || 'sin texto'}`;
}
```

**Prioridad**: Media 🟡

---

### 3. Alto Contraste y Tamaños de Fuente
**Descripción**: Opciones de accesibilidad visual.

**Implementación**:
```typescript
@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  fontSize = signal<'small' | 'medium' | 'large'>('medium');
  highContrast = signal(false);
  
  setFontSize(size: 'small' | 'medium' | 'large') {
    this.fontSize.set(size);
    document.documentElement.setAttribute('data-font-size', size);
  }
  
  toggleHighContrast() {
    this.highContrast.update(v => !v);
    document.documentElement.setAttribute(
      'data-high-contrast', 
      this.highContrast().toString()
    );
  }
}
```

```css
/* Tamaños de fuente */
[data-font-size="small"] {
  --font-size-base: 12px;
}

[data-font-size="medium"] {
  --font-size-base: 14px;
}

[data-font-size="large"] {
  --font-size-base: 18px;
}

/* Alto contraste */
[data-high-contrast="true"] {
  --bg-primary: #000000;
  --text-primary: #ffffff;
  --accent: #ffff00;
  --border: #ffffff;
}

[data-high-contrast="true"] .diagram-shape {
  stroke-width: 3px;
}

[data-high-contrast="true"] .connection-line {
  stroke-width: 3px;
}
```

**Prioridad**: Baja 🟢

---

## Seguridad

### 1. Autenticación con OAuth
**Descripción**: Login con Google, GitHub, Microsoft.

**Implementación**:
```typescript
@Injectable({ providedIn: 'root' })
export class OAuthService {
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    const user = {
      id: result.user.uid,
      email: result.user.email,
      name: result.user.displayName,
      avatar: result.user.photoURL
    };
    
    this.authService.setUser(user);
    this.router.navigate(['/editor']);
  }
  
  async loginWithGitHub() {
    const provider = new GithubAuthProvider();
    // Similar a Google
  }
  
  async loginWithMicrosoft() {
    const provider = new OAuthProvider('microsoft.com');
    // Similar a Google
  }
}
```

**Prioridad**: Alta 🔴

---

### 2. Encriptación de Diagramas
**Descripción**: Encriptar diagramas sensibles.

**Implementación**:
```typescript
@Injectable({ providedIn: 'root' })
export class EncryptionService {
  async encryptDiagram(diagram: DiagramState, password: string): Promise<string> {
    const key = await this.deriveKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(diagram));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Combinar IV + datos encriptados
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }
  
  async decryptDiagram(encrypted: string, password: string): Promise<DiagramState> {
    const key = await this.deriveKey(password);
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    const decoder = new TextDecoder();
    const json = decoder.decode(decrypted);
    
    return JSON.parse(json);
  }
  
  private async deriveKey(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('diagramador-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
}
```

**Prioridad**: Media 🟡

---

### 3. Permisos y Roles
**Descripción**: Control de acceso basado en roles.

**Implementación**:
```typescript
enum Role {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin',
  OWNER = 'owner'
}

interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
  share: boolean;
  export: boolean;
}

const rolePermissions: Record<Role, Permission> = {
  [Role.VIEWER]: {
    view: true,
    edit: false,
    delete: false,
    share: false,
    export: true
  },
  [Role.EDITOR]: {
    view: true,
    edit: true,
    delete: false,
    share: false,
    export: true
  },
  [Role.ADMIN]: {
    view: true,
    edit: true,
    delete: true,
    share: true,
    export: true
  },
  [Role.OWNER]: {
    view: true,
    edit: true,
    delete: true,
    share: true,
    export: true
  }
};

@Injectable({ providedIn: 'root' })
export class PermissionService {
  canEdit(diagramId: string): boolean {
    const role = this.getUserRole(diagramId);
    return rolePermissions[role].edit;
  }
  
  canDelete(diagramId: string): boolean {
    const role = this.getUserRole(diagramId);
    return rolePermissions[role].delete;
  }
  
  canShare(diagramId: string): boolean {
    const role = this.getUserRole(diagramId);
    return rolePermissions[role].share;
  }
}
```

**Prioridad**: Media 🟡

---

## Priorización de Mejoras

### Matriz de Priorización

| Mejora | Impacto | Esfuerzo | Prioridad | Fase |
|--------|---------|----------|-----------|------|
| Deshacer/Rehacer | Alto | Medio | 🔴 Alta | 1 |
| Edición Inline | Alto | Bajo | 🔴 Alta | 1 |
| Exportar Imágenes | Alto | Medio | 🔴 Alta | 1 |
| Menú Contextual | Alto | Bajo | 🔴 Alta | 1 |
| OAuth | Alto | Medio | 🔴 Alta | 1 |
| Colaboración Tiempo Real | Muy Alto | Alto | 🔴 Alta | 2 |
| IA Generación | Alto | Alto | 🔴 Alta | 2 |
| Importar desde BD | Alto | Alto | 🔴 Alta | 2 |
| Auto-Layout | Medio | Alto | 🟡 Media | 2 |
| Búsqueda/Filtrado | Medio | Bajo | 🟡 Media | 2 |
| Tooltips | Medio | Bajo | 🟡 Media | 2 |
| Dark Mode | Medio | Bajo | 🟡 Media | 2 |
| Tutorial Onboarding | Medio | Medio | 🟡 Media | 3 |
| Comentarios | Medio | Medio | 🟡 Media | 3 |
| Control Versiones | Medio | Alto | 🟡 Media | 3 |
| Dialectos SQL | Medio | Medio | 🟡 Media | 3 |
| Encriptación | Medio | Medio | 🟡 Media | 3 |
| Virtualización Canvas | Bajo | Alto | 🟢 Baja | 4 |
| Web Workers | Bajo | Alto | 🟢 Baja | 4 |
| Lazy Loading | Bajo | Medio | 🟢 Baja | 4 |
| Atajos Personalizables | Bajo | Medio | 🟢 Baja | 4 |
| Animaciones | Bajo | Bajo | 🟢 Baja | 4 |

### Roadmap Sugerido

#### Fase 1 (1-2 meses) - Fundamentos
- ✅ Deshacer/Rehacer
- ✅ Edición inline de texto
- ✅ Exportación a PNG/SVG/PDF
- ✅ Menú contextual
- ✅ OAuth (Google, GitHub)

#### Fase 2 (3-4 meses) - Colaboración
- ✅ Colaboración en tiempo real
- ✅ IA para generación de esquemas
- ✅ Importar desde bases de datos reales
- ✅ Auto-layout
- ✅ Búsqueda y filtrado
- ✅ Dark mode

#### Fase 3 (5-6 meses) - Profesional
- ✅ Sistema de comentarios
- ✅ Control de versiones
- ✅ Exportar a diferentes dialectos SQL
- ✅ Tutorial interactivo
- ✅ Encriptación de diagramas

#### Fase 4 (7-8 meses) - Optimización
- ✅ Virtualización del canvas
- ✅ Web Workers
- ✅ Lazy loading
- ✅ Atajos personalizables
- ✅ Animaciones mejoradas

---

## Conclusión

Estas mejoras transformarían el Diagramador SQL en una herramienta profesional de nivel empresarial, competitiva con soluciones como:
- Lucidchart
- draw.io
- dbdiagram.io
- MySQL Workbench
- pgAdmin

**Próximos Pasos**:
1. Validar prioridades con usuarios
2. Crear prototipos de features clave
3. Implementar Fase 1
4. Recopilar feedback
5. Iterar y mejorar

