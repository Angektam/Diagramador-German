# 🗺️ Mejora: Mini-mapa Arrastrable

## 🎯 Mejora Implementada

El mini-mapa ahora es **completamente arrastrable** y se puede posicionar en cualquier lugar del canvas.

---

## ✨ Características Nuevas

### 1. Header Arrastrable

El mini-mapa ahora tiene un header con:
- 🗺️ Icono y título "Mapa"
- ⋮⋮ Indicador visual de que es arrastrable
- Cursor `move` al pasar el mouse
- Feedback visual al hacer hover

### 2. Posicionamiento Libre

- **Antes**: Fijo en esquina inferior derecha
- **Ahora**: Arrastrable a cualquier posición
- Límites inteligentes (no se sale del canvas)
- Posición se mantiene al hacer zoom o scroll

### 3. Dos Modos de Interacción

**Modo 1: Navegar (Click en el mapa)**
- Click en el área del SVG para navegar
- Mueve el viewport a esa posición

**Modo 2: Arrastrar (Click en el header)**
- Click y arrastra desde el header
- Reposiciona el mini-mapa completo
- Notificación al soltar: "Mini-mapa reposicionado"

---

## 🔧 Implementación Técnica

### Cambios en el Código

```typescript
// NUEVO: Signal para posición del mini-mapa
minimapPosition = signal({ x: 20, y: 20 }); // Desde bottom-right

// NUEVO: Método para arrastrar el mini-mapa
onMinimapHeaderMouseDown(event: MouseEvent) {
  // Calcula delta de movimiento
  // Limita a bordes del wrapper
  // Actualiza posición
}

// MODIFICADO: Método de navegación
onMinimapMouseDown(event: MouseEvent) {
  // Ignora clicks en el header
  // Solo navega en el área del SVG
}
```

### Template Actualizado

```html
<!-- ANTES -->
<div class="minimap" #minimapRef (mousedown)="onMinimapMouseDown($event)">
  <svg class="minimap-svg">...</svg>
</div>

<!-- AHORA -->
<div class="minimap" 
     #minimapRef 
     [style.right.px]="minimapPosition().x" 
     [style.bottom.px]="minimapPosition().y"
     (mousedown)="onMinimapMouseDown($event)">
  <div class="minimap-header" (mousedown)="onMinimapHeaderMouseDown($event)">
    <span class="minimap-title">🗺️ Mapa</span>
    <span class="minimap-drag-hint">⋮⋮</span>
  </div>
  <svg class="minimap-svg">...</svg>
</div>
```

### Estilos CSS

```css
.minimap {
  position: absolute;
  /* Posición dinámica con signals */
  display: flex;
  flex-direction: column;
}

.minimap-header {
  background: rgba(30, 30, 30, 0.95);
  padding: 6px 10px;
  cursor: move;  /* Indica que es arrastrable */
  user-select: none;
}

.minimap-header:hover {
  background: rgba(40, 40, 40, 0.95);
}

.minimap-svg {
  flex: 1;
  cursor: pointer;  /* Para navegación */
}
```

---

## 💡 Cómo Usar

### Arrastrar el Mini-mapa

1. **Posiciona el cursor** sobre el header (🗺️ Mapa ⋮⋮)
2. **Click y mantén** presionado el botón del mouse
3. **Arrastra** a la posición deseada
4. **Suelta** para fijar en la nueva posición
5. Verás la notificación: "Mini-mapa reposicionado"

### Navegar con el Mini-mapa

1. **Click en el área del mapa** (no en el header)
2. El viewport salta a esa posición
3. Puedes seguir navegando con clicks

### Posiciones Recomendadas

```
┌─────────────────────────────────┐
│ ↖️ Esquina superior izquierda   │
│                                 │
│                                 │
│                                 │
│                ↘️ Inferior der. │
└─────────────────────────────────┘

Posiciones populares:
- Inferior derecha (default)
- Superior derecha
- Inferior izquierda
- Superior izquierda
```

---

## 🎨 Mejoras Visuales

### Header Interactivo

```
┌─────────────────────┐
│ 🗺️ Mapa        ⋮⋮  │ ← Header arrastrable
├─────────────────────┤
│                     │
│   [Mini-mapa SVG]   │ ← Área de navegación
│                     │
└─────────────────────┘
```

### Estados Visuales

1. **Normal**: Fondo oscuro semi-transparente
2. **Hover en header**: Fondo más claro
3. **Arrastrando**: Cursor `move`
4. **Hover en mapa**: Cursor `pointer`

---

## 🔍 Detalles Técnicos

### Cálculo de Posición

```typescript
// Posición desde bottom-right
[style.right.px]="minimapPosition().x"
[style.bottom.px]="minimapPosition().y"

// Delta de movimiento (invertido porque es right/bottom)
const deltaX = startX - e.clientX;
const deltaY = startY - e.clientY;
```

### Límites del Canvas

```typescript
// Evita que el mini-mapa se salga
const minX = 10;
const maxX = wrapperRect.width - minimapRect.width - 10;
const minY = 10;
const maxY = wrapperRect.height - minimapRect.height - 10;

newX = Math.max(minX, Math.min(maxX, newX));
newY = Math.max(minY, Math.min(maxY, newY));
```

### Separación de Eventos

```typescript
// Click en header → Arrastrar mini-mapa
if (target.closest('.minimap-header')) {
  return; // No navegar
}

// Click en SVG → Navegar
// Continúa con lógica de navegación
```

---

## 📊 Comparación

### Antes

```
❌ Posición fija (bottom: 20px, right: 20px)
❌ No se puede mover
❌ Puede tapar contenido importante
❌ Una sola forma de interactuar
```

### Ahora

```
✅ Posición dinámica y arrastrable
✅ Se puede mover a cualquier esquina
✅ Evita tapar contenido
✅ Dos modos: navegar y arrastrar
✅ Feedback visual claro
✅ Límites inteligentes
```

---

## 🎯 Casos de Uso

### 1. Diagrama con Toolbar Abajo

```
Problema: El mini-mapa tapa el toolbar
Solución: Arrastra el mini-mapa a la esquina superior derecha
```

### 2. Presentación en Pantalla Grande

```
Problema: El mini-mapa está muy lejos
Solución: Arrastra cerca del área de trabajo principal
```

### 3. Múltiples Monitores

```
Problema: El mini-mapa queda en el borde
Solución: Reposiciona según tu configuración
```

---

## 🐛 Manejo de Casos Edge

### 1. Mini-mapa Fuera de Límites

```typescript
// Si el wrapper cambia de tamaño, el mini-mapa se ajusta automáticamente
newX = Math.max(minX, Math.min(maxX, newX));
```

### 2. Click Ambiguo

```typescript
// El header tiene prioridad sobre el SVG
if (target.closest('.minimap-header')) {
  return; // Solo arrastrar, no navegar
}
```

### 3. Zoom y Scroll

```typescript
// La posición se mantiene relativa al wrapper
// No se ve afectada por zoom o scroll del canvas
```

---

## 🚀 Próximas Mejoras

### Corto Plazo
- [ ] Guardar posición en localStorage
- [ ] Botón para resetear a posición default
- [ ] Snap a esquinas (magnetismo)

### Mediano Plazo
- [ ] Redimensionar mini-mapa
- [ ] Ocultar/mostrar con atajo (M)
- [ ] Transparencia ajustable

### Largo Plazo
- [ ] Múltiples mini-mapas
- [ ] Mini-mapa flotante (fuera del canvas)
- [ ] Temas personalizables

---

## 📝 Notas de Implementación

### Performance

- ✅ Usa signals para reactividad eficiente
- ✅ Event listeners se limpian correctamente
- ✅ No impacta render del canvas principal

### Accesibilidad

- ✅ Cursor indica funcionalidad (move/pointer)
- ✅ Feedback visual en hover
- ✅ Notificación al reposicionar

### Compatibilidad

- ✅ Funciona con todas las mejoras anteriores
- ✅ Compatible con zoom
- ✅ Compatible con selección múltiple
- ✅ Compatible con copiar/pegar

---

## 🎓 Lecciones Aprendidas

### 1. Separación de Responsabilidades

```typescript
// Header → Arrastrar mini-mapa
onMinimapHeaderMouseDown()

// SVG → Navegar en canvas
onMinimapMouseDown()
```

### 2. Posicionamiento con Signals

```typescript
// Reactivo y eficiente
[style.right.px]="minimapPosition().x"
[style.bottom.px]="minimapPosition().y"
```

### 3. UX Intuitiva

- Header con cursor `move`
- SVG con cursor `pointer`
- Feedback inmediato
- Límites inteligentes

---

## 📚 Recursos

### Archivos Modificados

- ✅ `src/app/components/canvas/canvas.component.ts`
  - Nuevo signal: `minimapPosition`
  - Nuevo método: `onMinimapHeaderMouseDown()`
  - Método modificado: `onMinimapMouseDown()`
  - Template actualizado con header
  - Estilos CSS mejorados

### Documentación

- ✅ `MEJORA_MINIMAPA_ARRASTRABLE.md` - Este archivo
- ✅ `MEJORAS_IMPLEMENTADAS.md` - Actualizado
- ✅ `GUIA_RAPIDA.md` - Actualizado

---

**Fecha de implementación**: 2026-02-07  
**Desarrollador**: Kiro AI Assistant  
**Estado**: ✅ Completado y funcional  
**Versión**: 1.2.0
