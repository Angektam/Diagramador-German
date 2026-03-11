# 🔄 Mejora: Sistema de Deshacer/Rehacer (Undo/Redo)

## 🎯 Objetivo

Implementar un sistema de historial que permita deshacer y rehacer acciones en el diagramador.

## 📊 Nivel de Dificultad

**Complejidad**: ⭐⭐⭐ Intermedio  
**Tiempo estimado**: 2-3 horas  
**Conocimientos requeridos**: 
- TypeScript
- Angular Signals
- Manejo de estado

## 🎨 Diseño de la Funcionalidad

### Acciones a Rastrear
1. ✅ Crear tabla
2. ✅ Eliminar tabla
3. ✅ Mover tabla
4. ✅ Editar tabla (nombre, columnas)
5. ✅ Crear conexión
6. ✅ Eliminar conexión
7. ✅ Copiar/Pegar
8. ✅ Importar SQL

### Límites
- Historial máximo: 50 acciones
- No rastrear: Zoom, pan, selección

## 🏗️ Arquitectura

### 1. Crear Servicio de Historial

**Archivo**: `src/app/services/history.service.ts`

```typescript
import { Injectable, signal } from '@angular/core';

export interface HistoryAction {
  type: 'create' | 'delete' | 'update' | 'move';
  timestamp: number;
  data: any;
  undo: () => void;
  redo: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history = signal<HistoryAction[]>([]);
  private currentIndex = signal(-1);
  private maxHistory = 50;

  canUndo = signal(false);
  canRedo = signal(false);

  addAction(action: HistoryAction) {
    // Eliminar acciones futuras si estamos en medio del historial
    const current = this.currentIndex();
    if (current < this.history().length - 1) {
      this.history.set(this.history().slice(0, current + 1));
    }

    // Agregar nueva acción
    const newHistory = [...this.history(), action];
    
    // Limitar tamaño del historial
    if (newHistory.length > this.maxHistory) {
      newHistory.shift();
    } else {
      this.currentIndex.set(this.currentIndex() + 1);
    }

    this.history.set(newHistory);
    this.updateCanUndoRedo();
  }

  undo() {
    const current = this.currentIndex();
    if (current >= 0) {
      const action = this.history()[current];
      action.undo();
      this.currentIndex.set(current - 1);
      this.updateCanUndoRedo();
    }
  }

  redo() {
    const current = this.currentIndex();
    if (current < this.history().length - 1) {
      const action = this.history()[current + 1];
      action.redo();
      this.currentIndex.set(current + 1);
      this.updateCanUndoRedo();
    }
  }

  clear() {
    this.history.set([]);
    this.currentIndex.set(-1);
    this.updateCanUndoRedo();
  }

  private updateCanUndoRedo() {
    this.canUndo.set(this.currentIndex() >= 0);
    this.canRedo.set(this.currentIndex() < this.history().length - 1);
  }

  getHistorySize(): number {
    return this.history().length;
  }
}
```

### 2. Integrar en DiagramService

**Archivo**: `src/app/services/diagram.service.ts`

Agregar al inicio:
```typescript
import { HistoryService } from './history.service';

export class DiagramService {
  private history = inject(HistoryService);
  
  // ... resto del código
}
```

Modificar métodos existentes para registrar acciones:

#### Ejemplo: addShape
```typescript
addShape(shape: Shape) {
  const newShapes = [...this.shapes(), shape];
  this.shapes.set(newShapes);
  
  // Registrar en historial
  this.history.addAction({
    type: 'create',
    timestamp: Date.now(),
    data: { shape },
    undo: () => {
      this.shapes.set(this.shapes().filter(s => s.id !== shape.id));
    },
    redo: () => {
      this.shapes.set([...this.shapes(), shape]);
    }
  });
}
```

#### Ejemplo: deleteShape
```typescript
deleteShape(shapeId: string) {
  const shape = this.shapes().find(s => s.id === shapeId);
  if (!shape) return;
  
  const connections = this.connections().filter(
    c => c.fromId === shapeId || c.toId === shapeId
  );
  
  this.shapes.set(this.shapes().filter(s => s.id !== shapeId));
  this.connections.set(
    this.connections().filter(c => c.fromId !== shapeId && c.toId !== shapeId)
  );
  
  // Registrar en historial
  this.history.addAction({
    type: 'delete',
    timestamp: Date.now(),
    data: { shape, connections },
    undo: () => {
      this.shapes.set([...this.shapes(), shape]);
      this.connections.set([...this.connections(), ...connections]);
    },
    redo: () => {
      this.shapes.set(this.shapes().filter(s => s.id !== shapeId));
      this.connections.set(
        this.connections().filter(c => c.fromId !== shapeId && c.toId !== shapeId)
      );
    }
  });
}
```

#### Ejemplo: updateShape
```typescript
updateShape(shapeId: string, updates: Partial<Shape>) {
  const oldShape = this.shapes().find(s => s.id === shapeId);
  if (!oldShape) return;
  
  const oldShapeCopy = { ...oldShape };
  
  this.shapes.set(
    this.shapes().map(s => s.id === shapeId ? { ...s, ...updates } : s)
  );
  
  // Registrar en historial
  this.history.addAction({
    type: 'update',
    timestamp: Date.now(),
    data: { shapeId, oldShape: oldShapeCopy, updates },
    undo: () => {
      this.shapes.set(
        this.shapes().map(s => s.id === shapeId ? oldShapeCopy : s)
      );
    },
    redo: () => {
      this.shapes.set(
        this.shapes().map(s => s.id === shapeId ? { ...s, ...updates } : s)
      );
    }
  });
}
```

### 3. Actualizar Toolbar

**Archivo**: `src/app/components/toolbar/toolbar.component.ts`

Inyectar el servicio:
```typescript
export class ToolbarComponent {
  history = inject(HistoryService);
  
  // ... resto del código
}
```

Actualizar el template (buscar los botones deshabilitados):
```typescript
// Cambiar de:
<button class="dropdown-item" disabled>
  <span class="item-icon">↶</span>
  <span class="item-label">Deshacer</span>
  <span class="item-shortcut">Ctrl+Z</span>
</button>

// A:
<button 
  class="dropdown-item" 
  [disabled]="!history.canUndo()"
  (click)="history.undo()">
  <span class="item-icon">↶</span>
  <span class="item-label">Deshacer</span>
  <span class="item-shortcut">Ctrl+Z</span>
</button>

<button 
  class="dropdown-item" 
  [disabled]="!history.canRedo()"
  (click)="history.redo()">
  <span class="item-icon">↷</span>
  <span class="item-label">Rehacer</span>
  <span class="item-shortcut">Ctrl+Y</span>
</button>
```

También actualizar los botones de la barra de herramientas:
```typescript
<button 
  (click)="history.undo()" 
  [disabled]="!history.canUndo()"
  class="icon-btn" 
  title="Deshacer (Ctrl+Z)">
  ↶
</button>
<button 
  (click)="history.redo()" 
  [disabled]="!history.canRedo()"
  class="icon-btn" 
  title="Rehacer (Ctrl+Y)">
  ↷
</button>
```

### 4. Agregar Atajos de Teclado

**Archivo**: `src/app/services/keyboard-shortcuts.service.ts`

Agregar en el método `setupShortcuts()`:
```typescript
// Deshacer
if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
  e.preventDefault();
  this.history.undo();
  return;
}

// Rehacer (Ctrl+Y o Ctrl+Shift+Z)
if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
  e.preventDefault();
  this.history.redo();
  return;
}
```

## 📝 Checklist de Implementación

### Fase 1: Servicio Base
- [ ] Crear `src/app/services/history.service.ts`
- [ ] Implementar estructura de `HistoryAction`
- [ ] Implementar métodos `addAction()`, `undo()`, `redo()`
- [ ] Implementar signals `canUndo` y `canRedo`
- [ ] Agregar límite de historial (50 acciones)

### Fase 2: Integración con DiagramService
- [ ] Inyectar `HistoryService` en `DiagramService`
- [ ] Modificar `addShape()` para registrar acción
- [ ] Modificar `deleteShape()` para registrar acción
- [ ] Modificar `updateShape()` para registrar acción
- [ ] Modificar `moveShape()` para registrar acción
- [ ] Modificar `addConnection()` para registrar acción
- [ ] Modificar `deleteConnection()` para registrar acción

### Fase 3: UI
- [ ] Actualizar botones en toolbar (menú desplegable)
- [ ] Actualizar botones en barra de herramientas
- [ ] Agregar estados disabled/enabled según `canUndo`/`canRedo`
- [ ] Agregar tooltips informativos

### Fase 4: Atajos de Teclado
- [ ] Agregar Ctrl+Z para deshacer
- [ ] Agregar Ctrl+Y para rehacer
- [ ] Agregar Ctrl+Shift+Z como alternativa para rehacer
- [ ] Actualizar modal de atajos con nuevos shortcuts

### Fase 5: Testing
- [ ] Probar crear y deshacer tabla
- [ ] Probar eliminar y deshacer
- [ ] Probar editar y deshacer
- [ ] Probar múltiples deshacer/rehacer
- [ ] Probar límite de historial
- [ ] Probar atajos de teclado

## 🎨 Mejoras Opcionales

### Nivel 1 (Fácil)
- [ ] Mostrar contador de acciones disponibles
- [ ] Agregar tooltip con descripción de la acción
- [ ] Limpiar historial al crear nuevo diagrama

### Nivel 2 (Medio)
- [ ] Mostrar lista de historial en un panel
- [ ] Permitir saltar a cualquier punto del historial
- [ ] Agrupar acciones relacionadas (ej: copiar múltiples tablas)

### Nivel 3 (Avanzado)
- [ ] Persistir historial en localStorage
- [ ] Restaurar historial al recargar página
- [ ] Comprimir historial para ahorrar memoria

## 🐛 Casos Edge a Considerar

1. **Deshacer después de importar SQL**: Debe restaurar el estado anterior completo
2. **Deshacer con selección activa**: Debe limpiar la selección si es necesario
3. **Memoria**: Limitar a 50 acciones para evitar problemas de memoria
4. **Acciones compuestas**: Copiar/pegar múltiples elementos debe ser una sola acción
5. **Nuevo diagrama**: Debe limpiar el historial

## 📊 Métricas de Éxito

- ✅ Botones de undo/redo funcionan correctamente
- ✅ Atajos de teclado Ctrl+Z y Ctrl+Y funcionan
- ✅ Estados disabled/enabled se actualizan correctamente
- ✅ No hay pérdida de datos al deshacer/rehacer
- ✅ Rendimiento no se ve afectado (< 50ms por acción)

## 🔍 Testing Manual

### Test 1: Crear y Deshacer
1. Crear una tabla
2. Presionar Ctrl+Z
3. ✅ La tabla debe desaparecer

### Test 2: Eliminar y Deshacer
1. Crear una tabla
2. Eliminarla
3. Presionar Ctrl+Z
4. ✅ La tabla debe reaparecer

### Test 3: Múltiples Acciones
1. Crear 3 tablas
2. Presionar Ctrl+Z tres veces
3. ✅ Las 3 tablas deben desaparecer en orden inverso
4. Presionar Ctrl+Y tres veces
5. ✅ Las 3 tablas deben reaparecer

### Test 4: Editar y Deshacer
1. Crear una tabla llamada "users"
2. Cambiar nombre a "customers"
3. Presionar Ctrl+Z
4. ✅ El nombre debe volver a "users"

## 📚 Referencias

- [Command Pattern](https://refactoring.guru/design-patterns/command)
- [Memento Pattern](https://refactoring.guru/design-patterns/memento)
- [Angular Signals](https://angular.io/guide/signals)

## 💡 Tips para el Implementador

1. **Empieza simple**: Implementa primero solo crear/eliminar tablas
2. **Prueba frecuentemente**: Después de cada método modificado
3. **Usa console.log**: Para debuggear el estado del historial
4. **Copia profunda**: Usa `JSON.parse(JSON.stringify())` para copiar objetos
5. **Notificaciones**: Agrega feedback visual al deshacer/rehacer

## 🎯 Resultado Esperado

Al finalizar, el usuario podrá:
- ✅ Deshacer cualquier acción con Ctrl+Z
- ✅ Rehacer acciones con Ctrl+Y
- ✅ Ver estados enabled/disabled en botones
- ✅ Usar botones del toolbar
- ✅ Trabajar con confianza sabiendo que puede corregir errores

---

**Complejidad**: ⭐⭐⭐ Intermedio  
**Impacto**: ⭐⭐⭐⭐⭐ Muy Alto  
**Prioridad**: Alta  
**Tiempo estimado**: 2-3 horas  
**Estado**: 📋 Pendiente de implementación
