# Canvas Movible - Navegación Completa

## 🎯 Objetivo
Hacer que el pizarrón (canvas) del diagrama sea completamente movible y navegable en todas direcciones, similar a aplicaciones profesionales como Diagrams.net, Figma y Miro.

## ✅ Funcionalidades Implementadas

### 1. **Scroll Natural con Rueda del Mouse**
El canvas ahora responde naturalmente al scroll del mouse:
- **Scroll Vertical**: Rueda del mouse arriba/abajo
- **Scroll Horizontal**: Shift + Rueda del mouse
- **Scroll Bidireccional**: Gestos de trackpad funcionan automáticamente

### 2. **Panning (Arrastrar el Canvas)**
Múltiples formas de arrastrar el canvas libremente:

#### Método 1: Click Derecho + Arrastrar
```
1. Haz click derecho en el canvas vacío
2. Mantén presionado y arrastra
3. El canvas se mueve en la dirección que arrastras
```

#### Método 2: Botón Central del Mouse
```
1. Presiona el botón central (rueda clickeable)
2. Arrastra en cualquier dirección
3. Suelta para detener
```

#### Método 3: Shift + Click Izquierdo
```
1. Mantén presionada la tecla Shift
2. Haz click izquierdo y arrastra
3. El canvas se mueve contigo
```

### 3. **Soporte Táctil (Touch) - NUEVO**
Funciona en tablets, pantallas táctiles y trackpads:

#### Panning con un dedo
```
1. Toca el canvas con un dedo
2. Arrastra en cualquier dirección
3. El canvas se mueve suavemente
```

#### Zoom con Pinch (dos dedos)
```
1. Coloca dos dedos en el canvas
2. Sepáralos para hacer zoom in
3. Júntalos para hacer zoom out
```

#### Gestos de Trackpad
```
- Deslizar con dos dedos: Panning bidireccional
- Pinch: Zoom in/out
- Todo funciona de forma nativa y fluida
```

### 4. **Zoom con Punto Focal**
- **Ctrl + Rueda del Mouse**: Zoom in/out
- **Pinch en trackpad/pantalla táctil**: Zoom natural
- El zoom se centra en la posición del cursor/dedos
- Rango: 25% - 200%

### 4. **Canvas Infinito**
- Tamaño del canvas: 10,000 x 10,000 píxeles
- Puedes moverte libremente en todas direcciones
- Sin límites artificiales para tu creatividad

### 5. **Feedback Visual**
- Cursor cambia a "grabbing" durante el arrastre
- Minimapa muestra tu posición actual
- Scroll suave y responsivo

## 🎮 Guía de Controles

### Navegación Básica
| Acción | Control |
|--------|---------|
| Mover arriba/abajo | Rueda del mouse ↑↓ |
| Mover izquierda/derecha | Shift + Rueda |
| Arrastrar canvas | Click derecho + arrastrar |
| Arrastrar canvas | Botón central + arrastrar |
| Arrastrar canvas | Shift + Click izquierdo |

### Zoom
| Acción | Control |
|--------|---------|
| Zoom In | Ctrl + Rueda arriba |
| Zoom Out | Ctrl + Rueda abajo |
| Zoom centrado | El zoom sigue tu cursor |

### Selección y Edición
| Acción | Control |
|--------|---------|
| Mover forma | Click + arrastrar forma |
| Selección múltiple | Ctrl + Click en formas |
| Deseleccionar todo | Esc o Click en canvas vacío |

## 🔧 Detalles Técnicos

### Propiedad `touch-action`
```css
.canvas-wrapper {
  touch-action: pan-x pan-y pinch-zoom;
  -webkit-overflow-scrolling: touch;
}

.canvas-wrapper.panning {
  touch-action: none; /* Control manual durante panning */
}

.canvas-container,
.canvas-svg {
  touch-action: none; /* Prevenir gestos nativos */
}
```

### Eventos Táctiles
```typescript
// Un dedo = Panning
onTouchStart(event: TouchEvent) {
  if (event.touches.length === 1) {
    this.isTouchPanning = true;
    // Iniciar panning
  }
}

// Dos dedos = Zoom (Pinch)
onTouchStart(event: TouchEvent) {
  if (event.touches.length === 2) {
    // Calcular distancia inicial
    this.touchStartDistance = distance;
    this.touchStartZoom = currentZoom;
  }
}

// Movimiento táctil
onTouchMove(event: TouchEvent) {
  if (event.touches.length === 1) {
    // Panning
  } else if (event.touches.length === 2) {
    // Zoom con pinch
    const scale = currentDistance / startDistance;
    const newZoom = startZoom * scale;
  }
}
```

### Estructura del Canvas
```typescript
canvas-wrapper (scrollable)
  └── canvas-container (10000x10000px)
      ├── canvas-grid (puntos de guía)
      ├── canvas-svg (formas y conexiones)
      └── minimap (navegación rápida)
```

### Eventos de Mouse
```typescript
// Scroll con rueda
onWheel(event: WheelEvent) {
  if (event.ctrlKey) {
    // Zoom
  } else if (event.shiftKey) {
    // Scroll horizontal
  } else {
    // Scroll vertical
  }
}

// Panning con mouse
onCanvasMouseDown(event: MouseEvent) {
  if (event.button === 2 || event.button === 1) {
    // Activar panning
    this.startPanning(event);
  }
}
```

### Prevención de Menú Contextual
```typescript
onContextMenu(event: MouseEvent) {
  // Prevenir menú en canvas vacío
  // para permitir panning con click derecho
  if (!target.closest('.diagram-shape')) {
    event.preventDefault();
  }
}
```

## 🎨 Experiencia de Usuario

### Comportamiento Intuitivo
1. **Sin Conflictos**: El scroll no interfiere con el arrastre de formas
2. **Múltiples Opciones**: Varios métodos para la misma acción
3. **Feedback Inmediato**: Cursor y minimapa se actualizan en tiempo real
4. **Performance**: Scroll fluido incluso con muchas formas

### Compatibilidad
- ✅ Mouse tradicional con rueda
- ✅ Trackpad con gestos multitáctiles
- ✅ Mouse con botón central
- ✅ Click derecho para panning
- ✅ Atajos de teclado (Shift, Ctrl)
- ✅ **Pantallas táctiles (tablets, touch screens)**
- ✅ **Gestos de pinch para zoom**
- ✅ **Panning con un dedo en dispositivos táctiles**

## 📊 Comparación con Otras Herramientas

| Característica | Diagrams.net | Figma | Miro | Nuestra App |
|----------------|--------------|-------|------|-------------|
| Scroll con rueda | ✅ | ✅ | ✅ | ✅ |
| Panning con click derecho | ✅ | ❌ | ✅ | ✅ |
| Panning con botón central | ✅ | ✅ | ✅ | ✅ |
| Zoom con Ctrl+Rueda | ✅ | ✅ | ✅ | ✅ |
| Canvas infinito | ✅ | ✅ | ✅ | ✅ |
| Minimapa | ✅ | ❌ | ✅ | ✅ |

## 🚀 Mejoras Futuras

### Navegación Avanzada
- [ ] Zoom con gestos de pinch en trackpad
- [ ] Doble click para centrar en forma
- [ ] Botón "Fit to screen" (ajustar todo a la pantalla)
- [ ] Navegación con teclas de flecha

### Indicadores Visuales
- [ ] Indicadores de scroll en los bordes
- [ ] Animación suave al navegar con minimapa
- [ ] Breadcrumbs de posición

### Accesibilidad
- [ ] Navegación con teclado completa
- [ ] Zoom con + y - del teclado
- [ ] Atajos personalizables

## 💡 Consejos de Uso

### Para Diagramas Grandes
1. Usa el **minimapa** para navegación rápida
2. **Zoom out** (Ctrl + Rueda abajo) para ver todo
3. **Click derecho + arrastrar** para moverte rápido

### Para Trabajo Preciso
1. **Zoom in** (Ctrl + Rueda arriba) para detalles
2. Usa **Shift + Rueda** para ajustes horizontales finos
3. Activa **Snap to Grid** (tecla G) para alineación

### Para Presentaciones
1. **Zoom** para enfocar áreas específicas
2. Usa el **minimapa** para mostrar contexto
3. **Panning suave** para transiciones fluidas

## 🐛 Solución de Problemas

### El scroll no funciona
- Verifica que el cursor esté sobre el canvas
- Asegúrate de no estar sobre una forma seleccionada

### El panning no se activa
- Intenta con click derecho en un área vacía del canvas
- Prueba con el botón central del mouse
- Usa Shift + Click izquierdo como alternativa

### El zoom es muy rápido/lento
- El zoom está optimizado para 10 unidades por scroll
- Usa movimientos más pequeños de la rueda para control fino

## 📝 Notas de Implementación

### CSS Mejorado
```css
.canvas-wrapper {
  overflow: auto;
  scroll-behavior: auto; /* Responsivo, no smooth */
  cursor: default;
}

.canvas-wrapper.panning {
  cursor: grabbing !important;
}
```

### Sincronización con Minimapa
```typescript
updateMinimapViewport() {
  const scrollX = wrapper.scrollLeft;
  const scrollY = wrapper.scrollTop;
  const viewWidth = wrapper.clientWidth;
  const viewHeight = wrapper.clientHeight;
  
  this.minimapViewport.set({
    x: scrollX,
    y: scrollY,
    width: viewWidth,
    height: viewHeight
  });
}
```

---

**Fecha de implementación**: Febrero 2026
**Estado**: ✅ Completado y funcional
**Compatibilidad**: Chrome, Firefox, Edge, Safari
