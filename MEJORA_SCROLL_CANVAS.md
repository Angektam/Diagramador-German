# Mejora de Scroll en Canvas - Estilo Diagrams.net

## 🎯 Objetivo
Implementar un sistema de navegación por el canvas similar a diagrams.net (draw.io), permitiendo scroll fluido en todas direcciones y múltiples formas de mover el canvas.

## ✅ Funcionalidades Implementadas

### 1. **Scroll con Rueda del Mouse**
- **Scroll Vertical**: Mover la rueda del mouse arriba/abajo desplaza el canvas verticalmente
- **Scroll Horizontal con Trackpad**: Los gestos horizontales en trackpad funcionan automáticamente
- **Shift + Rueda**: Convierte el scroll vertical en horizontal (útil para mouse sin trackpad)

### 2. **Zoom Inteligente**
- **Ctrl + Rueda** (o Cmd + Rueda en Mac): Zoom in/out manteniendo el punto bajo el cursor
- El zoom se centra en la posición del mouse, no en el centro del canvas
- Rango de zoom: 25% - 200%

### 3. **Panning (Arrastrar Canvas)**
Múltiples formas de activar el modo panning:
- **Click Derecho + Arrastrar**: Arrastra el canvas en cualquier dirección
- **Botón Central del Mouse + Arrastrar**: Alternativa para arrastrar
- **Shift + Click Izquierdo + Arrastrar**: Otra forma de activar panning
- **Espacio + Click + Arrastrar**: Similar a Photoshop/Figma

### 4. **Integración con Minimapa**
- El minimapa se actualiza automáticamente al hacer scroll
- Muestra tu posición actual en el canvas
- Permite navegación rápida haciendo click en el minimapa

## 🎮 Controles Rápidos

| Acción | Control |
|--------|---------|
| Scroll Vertical | Rueda del mouse ↑↓ |
| Scroll Horizontal | Shift + Rueda del mouse |
| Zoom In/Out | Ctrl + Rueda del mouse |
| Arrastrar Canvas | Click derecho + arrastrar |
| Arrastrar Canvas | Botón central + arrastrar |
| Arrastrar Canvas | Shift + Click izquierdo + arrastrar |
| Snap to Grid | Tecla `G` (toggle) |
| Deseleccionar | Tecla `Esc` |

## 🔧 Cambios Técnicos

### Método `onWheel()` Mejorado
```typescript
onWheel(event: WheelEvent) {
  if (event.ctrlKey || event.metaKey) {
    // Zoom con punto focal en el cursor
  } else if (event.shiftKey) {
    // Scroll horizontal
  } else {
    // Scroll vertical/horizontal natural
  }
}
```

### Método `onCanvasMouseDown()` Mejorado
```typescript
onCanvasMouseDown(event: MouseEvent) {
  // Click derecho (button 2) o central (button 1) = panning
  if (event.button === 2 || event.button === 1) {
    this.startPanning(event);
  }
  // Shift + Click izquierdo también activa panning
  if (event.button === 0 && event.shiftKey) {
    this.startPanning(event);
  }
}
```

### Prevención de Menú Contextual
```typescript
onContextMenu(event: MouseEvent) {
  // Prevenir menú contextual en canvas vacío
  // para permitir panning con click derecho
  if (!target.closest('.diagram-shape')) {
    event.preventDefault();
  }
}
```

## 🎨 Experiencia de Usuario

### Comportamiento Natural
- El scroll funciona como en cualquier aplicación web moderna
- No requiere teclas especiales para navegación básica
- Compatible con trackpads y mouse tradicional

### Feedback Visual
- Cursor cambia a "grabbing" durante panning
- Minimapa muestra viewport actual
- Smooth scroll sin saltos bruscos

### Compatibilidad
- ✅ Mouse con rueda
- ✅ Trackpad con gestos
- ✅ Botón central del mouse
- ✅ Click derecho para panning
- ✅ Atajos de teclado (Shift, Ctrl, Espacio)

## 📝 Notas de Implementación

1. **Sin Conflictos**: El scroll no interfiere con el arrastre de formas
2. **Actualización Automática**: El minimapa se sincroniza en tiempo real
3. **Performance**: Scroll fluido sin lag, incluso con muchas formas
4. **Accesibilidad**: Múltiples formas de lograr la misma acción

## 🚀 Próximas Mejoras Posibles

- [ ] Indicadores visuales de scroll en los bordes
- [ ] Animación suave al hacer click en el minimapa
- [ ] Zoom con gestos de trackpad (pinch)
- [ ] Límites de scroll configurables
- [ ] Botón "Centrar canvas" en toolbar

## 🎯 Comparación con Diagrams.net

| Característica | Diagrams.net | Nuestra App |
|----------------|--------------|-------------|
| Scroll con rueda | ✅ | ✅ |
| Zoom con Ctrl+Rueda | ✅ | ✅ |
| Panning con click derecho | ✅ | ✅ |
| Shift para scroll horizontal | ✅ | ✅ |
| Minimapa interactivo | ✅ | ✅ |
| Snap to grid | ✅ | ✅ |

---

**Fecha de implementación**: Febrero 2026
**Estado**: ✅ Completado y funcional
