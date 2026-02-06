# 🎨 Nuevas Funcionalidades del Canvas

## ✨ Características Implementadas

### 1. 🗺️ Mini-mapa de Navegación
- **Ubicación**: Esquina inferior derecha del canvas
- **Funcionalidad**: 
  - Muestra una vista general de todo el diagrama
  - El rectángulo azul indica el viewport actual
  - Click en el mini-mapa para navegar rápidamente
  - Drag en el mini-mapa para mover el viewport

### 2. 🔍 Zoom con Rueda del Mouse
- **Atajo**: `Ctrl + Rueda del Mouse`
- **Funcionalidad**:
  - Rueda hacia arriba: Acercar (+10%)
  - Rueda hacia abajo: Alejar (-10%)
  - Rango: 25% - 200%
- **Controles adicionales**:
  - Botones `+` y `-` en el toolbar
  - Botón `⊙` para restablecer al 100%

### 3. 📏 Guías de Alineación (Snap to Grid)
- **Estado por defecto**: Activado
- **Atajo para toggle**: Tecla `G`
- **Funcionalidad**:
  - Alinea automáticamente las formas a una cuadrícula de 20px
  - Muestra guías visuales (líneas azules) al alinear con otras formas
  - Alineación inteligente: bordes, centros y esquinas
  - Umbral de snap: 10px

### 4. ✅ Selección Múltiple
- **Atajo**: `Ctrl + Click` (o `Cmd + Click` en Mac)
- **Funcionalidad**:
  - Selecciona múltiples formas manteniendo Ctrl
  - Mueve todas las formas seleccionadas simultáneamente
  - Indicador visual: borde azul brillante con glow
  - Contador en el toolbar muestra cantidad seleccionada

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + Click` | Agregar/quitar forma de la selección |
| `Ctrl + A` | Seleccionar todas las formas |
| `Escape` | Deseleccionar todo |
| `Delete` / `Backspace` | Eliminar formas seleccionadas |
| `G` | Toggle Snap to Grid ON/OFF |
| `Ctrl + Rueda` | Zoom in/out |

## 🎯 Mejoras Visuales

### Formas Seleccionadas
- Borde azul brillante (3px)
- Efecto glow/resplandor
- Transición suave al seleccionar

### Guías de Alineación
- Líneas azules semi-transparentes
- Aparecen solo durante el arrastre
- Se ocultan automáticamente al soltar

### Mini-mapa
- Fondo oscuro semi-transparente
- Formas en gris, seleccionadas en azul
- Viewport con borde azul
- Efecto blur en el fondo

## 💡 Tips de Uso

1. **Organización rápida**: Usa `G` para activar/desactivar snap to grid según necesites precisión o libertad
2. **Navegación eficiente**: Usa el mini-mapa para saltar rápidamente entre secciones del diagrama
3. **Edición masiva**: Selecciona múltiples formas con Ctrl+Click y muévelas juntas
4. **Zoom preciso**: Usa Ctrl+Rueda para ajustar el nivel de detalle mientras trabajas
5. **Alineación perfecta**: Las guías te ayudan a mantener todo ordenado automáticamente

## 🔧 Configuración Técnica

### Grid Size
- Tamaño de cuadrícula: 20px
- Modificable en `CanvasComponent.GRID_SIZE`

### Snap Threshold
- Umbral de alineación: 10px
- Modificable en `calculateAlignmentGuides()`

### Zoom Range
- Mínimo: 25%
- Máximo: 200%
- Incremento: 10%

## 🚀 Próximas Mejoras Sugeridas

- [ ] Selección por área (drag rectangle)
- [ ] Copiar/pegar formas (Ctrl+C / Ctrl+V)
- [ ] Agrupar formas seleccionadas
- [ ] Distribución automática (horizontal/vertical)
- [ ] Alineación por botones (izquierda, centro, derecha)
- [ ] Zoom a selección (fit to selection)
- [ ] Historial de zoom (zoom stack)
