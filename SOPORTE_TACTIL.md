# Soporte Táctil Completo - Touch Action

## 🎯 Objetivo
Implementar soporte completo para dispositivos táctiles (tablets, pantallas touch, trackpads) usando la propiedad CSS `touch-action` y eventos táctiles nativos.

## ✅ Implementación

### 1. **Propiedad CSS `touch-action`**

#### Canvas Wrapper (Contenedor Principal)
```css
.canvas-wrapper {
  touch-action: pan-x pan-y pinch-zoom;
  -webkit-overflow-scrolling: touch;
}
```
- `pan-x pan-y`: Permite panning horizontal y vertical
- `pinch-zoom`: Permite zoom con gestos de pinch
- `-webkit-overflow-scrolling: touch`: Scroll suave en iOS

#### Durante Panning Manual
```css
.canvas-wrapper.panning {
  touch-action: none;
}
```
- `none`: Desactiva gestos nativos durante panning manual
- Permite control total del movimiento

#### Canvas Container y SVG
```css
.canvas-container,
.canvas-svg {
  touch-action: none;
}
```
- Previene gestos nativos del navegador
- Permite implementar gestos personalizados

### 2. **Eventos Táctiles Implementados**

#### TouchStart (Inicio del Toque)
```typescript
onTouchStart(event: TouchEvent): void {
  if (event.touches.length === 1) {
    // Un dedo = Panning
    this.isTouchPanning = true;
    const touch = event.touches[0];
    this.lastTouchX = touch.clientX;
    this.lastTouchY = touch.clientY;
    
  } else if (event.touches.length === 2) {
    // Dos dedos = Zoom (Pinch)
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    // Calcular distancia inicial entre dedos
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    this.touchStartDistance = Math.sqrt(dx * dx + dy * dy);
    this.touchStartZoom = this.diagram.zoomLevel();
  }
}
```

#### TouchMove (Movimiento)
```typescript
onTouchMove(event: TouchEvent): void {
  if (event.touches.length === 1 && this.isTouchPanning) {
    // Panning con un dedo
    event.preventDefault();
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.panStart.x;
    const deltaY = touch.clientY - this.panStart.y;
    
    wrapper.scrollLeft = this.panStart.scrollLeft - deltaX;
    wrapper.scrollTop = this.panStart.scrollTop - deltaY;
    
  } else if (event.touches.length === 2) {
    // Zoom con pinch
    event.preventDefault();
    
    const currentDistance = calculateDistance(touches);
    const scale = currentDistance / this.touchStartDistance;
    const newZoom = this.touchStartZoom * scale;
    
    this.diagram.setZoom(newZoom);
  }
}
```

#### TouchEnd (Fin del Toque)
```typescript
onTouchEnd(event: TouchEvent): void {
  if (event.touches.length === 0) {
    // Todos los dedos levantados
    this.isTouchPanning = false;
    this.touchStartDistance = 0;
    wrapper.classList.remove('panning');
    
  } else if (event.touches.length === 1) {
    // Quedó un dedo, reiniciar panning
    const touch = event.touches[0];
    this.panStart = {
      x: touch.clientX,
      y: touch.clientY,
      scrollLeft: wrapper.scrollLeft,
      scrollTop: wrapper.scrollTop
    };
  }
}
```

## 🎮 Gestos Soportados

### En Pantallas Táctiles (Tablets, Touch Screens)

| Gesto | Acción | Descripción |
|-------|--------|-------------|
| 👆 Un dedo + arrastrar | Panning | Mueve el canvas en cualquier dirección |
| 🤏 Dos dedos separar | Zoom In | Acerca el contenido |
| 🤏 Dos dedos juntar | Zoom Out | Aleja el contenido |
| 👆 Tap en forma | Seleccionar | Selecciona una forma |
| 👆 Tap en canvas vacío | Deseleccionar | Limpia la selección |

### En Trackpads

| Gesto | Acción | Descripción |
|-------|--------|-------------|
| 👆👆 Dos dedos deslizar | Panning | Scroll bidireccional natural |
| 🤏 Pinch | Zoom | Zoom in/out natural |
| 👆 Click + arrastrar | Mover forma | Arrastra formas seleccionadas |

## 🔍 Valores de `touch-action`

### Valores Utilizados

| Valor | Uso | Descripción |
|-------|-----|-------------|
| `pan-x` | Canvas wrapper | Permite panning horizontal |
| `pan-y` | Canvas wrapper | Permite panning vertical |
| `pinch-zoom` | Canvas wrapper | Permite zoom con pinch |
| `none` | Durante panning | Desactiva todos los gestos nativos |

### Otros Valores Disponibles (No Usados)

| Valor | Descripción |
|-------|-------------|
| `auto` | Comportamiento por defecto del navegador |
| `manipulation` | Permite pan y zoom, pero no doble-tap |
| `pan-left` | Solo panning hacia la izquierda |
| `pan-right` | Solo panning hacia la derecha |
| `pan-up` | Solo panning hacia arriba |
| `pan-down` | Solo panning hacia abajo |

## 📱 Compatibilidad de Dispositivos

### Dispositivos Soportados
- ✅ **Tablets** (iPad, Android tablets)
- ✅ **Pantallas táctiles** (Windows touch, Chrome OS)
- ✅ **Trackpads** (MacBook, Windows laptops)
- ✅ **Pantallas 2-en-1** (Surface, convertibles)
- ✅ **Smartphones** (en modo landscape)

### Navegadores Compatibles
- ✅ Chrome/Edge (Chromium) - Soporte completo
- ✅ Safari (iOS/macOS) - Soporte completo
- ✅ Firefox - Soporte completo
- ✅ Samsung Internet - Soporte completo

## 🎨 Experiencia de Usuario

### Comportamiento Natural
1. **Gestos Intuitivos**: Los gestos funcionan como en apps nativas
2. **Sin Conflictos**: No interfiere con la selección de formas
3. **Feedback Visual**: Cursor y clases CSS indican el estado
4. **Smooth Performance**: Gestos fluidos sin lag

### Prevención de Comportamientos No Deseados
```typescript
// Prevenir scroll nativo durante gestos personalizados
event.preventDefault();

// Prevenir zoom del navegador
touch-action: pinch-zoom; // Controlado por nosotros

// Prevenir selección de texto
user-select: none;
```

## 🔧 Propiedades Adicionales

### Para iOS Safari
```css
-webkit-overflow-scrolling: touch;
-webkit-touch-callout: none;
-webkit-user-select: none;
```

### Para Mejor Performance
```css
will-change: transform;
transform: translateZ(0); /* Activar aceleración GPU */
```

## 📊 Ventajas de `touch-action`

### vs JavaScript Puro
| Aspecto | touch-action | Solo JavaScript |
|---------|--------------|-----------------|
| Performance | ⚡ Mejor | 🐌 Más lento |
| Código | 📝 Menos | 📚 Más complejo |
| Compatibilidad | ✅ Nativa | ⚠️ Requiere polyfills |
| Mantenimiento | 😊 Fácil | 😰 Difícil |

### Beneficios
1. **Performance**: El navegador optimiza los gestos nativamente
2. **Simplicidad**: Menos código JavaScript necesario
3. **Accesibilidad**: Funciona con tecnologías asistivas
4. **Batería**: Consume menos energía en dispositivos móviles

## 🐛 Solución de Problemas

### Los gestos no funcionan
```typescript
// Verificar que touch-action esté aplicado
const wrapper = document.querySelector('.canvas-wrapper');
console.log(getComputedStyle(wrapper).touchAction);
// Debe mostrar: "pan-x pan-y pinch-zoom"
```

### El zoom es muy sensible
```typescript
// Ajustar el factor de escala
const scale = currentDistance / this.touchStartDistance;
const dampedScale = 1 + (scale - 1) * 0.5; // Reducir sensibilidad
const newZoom = this.touchStartZoom * dampedScale;
```

### El panning es irregular
```typescript
// Asegurar que preventDefault() se llama
onTouchMove(event: TouchEvent) {
  event.preventDefault(); // Importante!
  // ... resto del código
}
```

## 📝 Mejores Prácticas

### 1. Usar `touch-action` en lugar de `preventDefault()`
```css
/* ✅ Mejor */
.canvas-wrapper {
  touch-action: pan-x pan-y;
}

/* ❌ Evitar */
element.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Bloquea todo
});
```

### 2. Combinar con Eventos de Mouse
```typescript
// Soportar tanto touch como mouse
onTouchStart(event: TouchEvent) { /* ... */ }
onMouseDown(event: MouseEvent) { /* ... */ }
```

### 3. Limpiar Estado al Terminar
```typescript
onTouchEnd(event: TouchEvent) {
  this.isTouchPanning = false;
  this.touchStartDistance = 0;
  wrapper.classList.remove('panning');
}
```

## 🚀 Próximas Mejoras

- [ ] Gestos de tres dedos para funciones especiales
- [ ] Rotación con dos dedos
- [ ] Vibración háptica en dispositivos compatibles
- [ ] Gestos personalizables por el usuario
- [ ] Soporte para stylus/Apple Pencil

## 📚 Referencias

- [MDN: touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
- [W3C: Pointer Events](https://www.w3.org/TR/pointerevents/)
- [Google: Touch Events](https://developers.google.com/web/fundamentals/design-and-ux/input/touch)

---

**Fecha de implementación**: Febrero 2026
**Estado**: ✅ Completado y funcional
**Dispositivos probados**: Desktop, Tablet, Touch Screen
