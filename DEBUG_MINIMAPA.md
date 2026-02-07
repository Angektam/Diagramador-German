# 🐛 Debug: Mini-mapa No Se Mueve

## 🔍 Pasos para Verificar

### 1. Abrir la Consola del Navegador

1. Presiona **F12**
2. Ve a la pestaña **Console**
3. Limpia la consola (Ctrl+L)

### 2. Probar el Botón

1. **Click en el botón ⋮⋮** del mini-mapa
2. **Verifica en la consola**:
   ```
   Toggle minimap moving: true
   ```
3. **Verifica visualmente**:
   - El botón debe cambiar a 📍
   - El botón debe parpadear
   - El borde del mini-mapa debe brillar en azul
   - Debe aparecer notificación: "Click en el canvas para posicionar el mini-mapa"

### 3. Probar el Click en Canvas

1. **Click en cualquier parte del canvas**
2. **Verifica en la consola**:
   ```
   Canvas mousedown, minimapMoving: true
   Posicionando mini-mapa desde canvas click
   Posicionando mini-mapa: {clickX: ..., clickY: ..., newX: ..., newY: ...}
   ```
3. **Verifica visualmente**:
   - El mini-mapa debe moverse
   - El botón debe volver a ⋮⋮
   - Debe aparecer notificación: "Mini-mapa reposicionado"

---

## ❌ Problemas Comunes

### Problema 1: El botón no cambia a 📍

**Síntoma**: Click en ⋮⋮ pero no pasa nada

**Verificar en consola**:
```
¿Aparece "Toggle minimap moving: true"?
```

**Si NO aparece**:
- El evento click no se está capturando
- Verifica que estés haciendo click exactamente en el botón
- Recarga la página (Ctrl+R)

**Si SÍ aparece pero el botón no cambia**:
- Problema de renderizado
- Verifica que `minimapMoving()` sea un signal
- Abre las DevTools → Elements → Busca el botón y verifica la clase `active`

---

### Problema 2: El mini-mapa no se mueve al hacer click

**Síntoma**: Botón en 📍 pero click en canvas no hace nada

**Verificar en consola**:
```
¿Aparece "Canvas mousedown, minimapMoving: true"?
```

**Si NO aparece**:
- El evento mousedown del canvas no se está capturando
- Verifica que el canvas tenga el listener `(mousedown)="onCanvasMouseDown($event)"`

**Si SÍ aparece pero no se mueve**:
- Verifica los valores en el log:
  ```
  Posicionando mini-mapa: {
    clickX: ...,  ← Debe ser > 0
    clickY: ...,  ← Debe ser > 0
    newX: ...,    ← Debe cambiar
    newY: ...     ← Debe cambiar
  }
  ```

---

### Problema 3: El mini-mapa se mueve pero a posición incorrecta

**Síntoma**: Se mueve pero no donde hiciste click

**Causa**: Cálculo de posición incorrecto

**Solución**: Verifica los logs:
```javascript
Posicionando mini-mapa: {
  clickX: 500,        // Posición X del click
  clickY: 300,        // Posición Y del click
  newX: 200,          // Nueva posición right
  newY: 150,          // Nueva posición bottom
  wrapperWidth: 1200, // Ancho del canvas
  wrapperHeight: 800  // Alto del canvas
}
```

El cálculo debe ser:
```
newX = wrapperWidth - clickX - (minimapWidth / 2)
newY = wrapperHeight - clickY - (minimapHeight / 2)
```

---

## 🔧 Verificación Manual del Código

### 1. Verificar el Signal

Abre la consola y ejecuta:
```javascript
// En la consola del navegador
angular.getComponent(document.querySelector('app-canvas')).minimapMoving()
```

Debe devolver `false` (o `true` si está activo)

### 2. Verificar el Template

Busca en el código:
```html
<button class="minimap-move-btn" 
        [class.active]="minimapMoving()" 
        title="Click para mover el mini-mapa">
  {{ minimapMoving() ? '📍' : '⋮⋮' }}
</button>
```

### 3. Verificar los Estilos

Busca en el código:
```css
.minimap.moving {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
  border-color: var(--accent);
}
```

---

## 🧪 Test Manual Paso a Paso

### Test 1: Activar Modo Mover

```
1. Abre la consola (F12)
2. Click en ⋮⋮
3. Verifica:
   ✅ Console: "Toggle minimap moving: true"
   ✅ Visual: Botón cambia a 📍
   ✅ Visual: Borde azul brillante
   ✅ Notificación: "Click en el canvas..."
```

### Test 2: Posicionar Mini-mapa

```
1. Con el modo activo (📍)
2. Click en el centro del canvas
3. Verifica:
   ✅ Console: "Canvas mousedown, minimapMoving: true"
   ✅ Console: "Posicionando mini-mapa desde canvas click"
   ✅ Console: "Posicionando mini-mapa: {...}"
   ✅ Visual: Mini-mapa se mueve
   ✅ Visual: Botón vuelve a ⋮⋮
   ✅ Notificación: "Mini-mapa reposicionado"
```

### Test 3: Cancelar Modo

```
1. Click en ⋮⋮ (activar)
2. Click en ⋮⋮ otra vez (desactivar)
3. Verifica:
   ✅ Console: "Toggle minimap moving: false"
   ✅ Visual: Botón vuelve a ⋮⋮
   ✅ Visual: Borde vuelve a gris
   ✅ Notificación: "Modo normal: click para navegar"
```

---

## 🔍 Inspección con DevTools

### 1. Inspeccionar el Botón

```
1. Click derecho en el botón ⋮⋮
2. "Inspeccionar elemento"
3. Verifica:
   - Clase: minimap-move-btn
   - Atributo: [class.active]="minimapMoving()"
   - Evento: (click)="toggleMinimapMoving($event)"
```

### 2. Inspeccionar el Mini-mapa

```
1. Click derecho en el mini-mapa
2. "Inspeccionar elemento"
3. Verifica:
   - Clase: minimap
   - Clase dinámica: [class.moving]="minimapMoving()"
   - Estilos: [style.right.px] y [style.bottom.px]
```

### 3. Ver los Valores en Tiempo Real

```
1. En Elements, selecciona el mini-mapa
2. En Console, ejecuta:
   $0.style.right  // Debe mostrar "20px" o similar
   $0.style.bottom // Debe mostrar "20px" o similar
```

---

## 🆘 Si Nada Funciona

### Opción 1: Recargar la Página

```
1. Ctrl + R (recarga normal)
2. O Ctrl + Shift + R (recarga forzada)
3. Prueba otra vez
```

### Opción 2: Limpiar Caché

```
1. F12 → Network
2. Check "Disable cache"
3. Recarga la página
```

### Opción 3: Verificar la Versión del Código

```
1. Abre src/app/components/canvas/canvas.component.ts
2. Busca: minimapMoving = signal(false)
3. Busca: toggleMinimapMoving(event: Event)
4. Busca: positionMinimap(event: MouseEvent)
```

Si no encuentras estos métodos, el código no está actualizado.

---

## 📊 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] La consola está abierta (F12)
- [ ] Hiciste click exactamente en el botón ⋮⋮
- [ ] El botón cambió a 📍
- [ ] El borde del mini-mapa está azul
- [ ] Apareció la notificación
- [ ] Hiciste click en el canvas (no en una forma)
- [ ] Revisaste los logs en la consola
- [ ] Recargaste la página

---

## 🎯 Logs Esperados (Completos)

### Secuencia Correcta

```
1. Click en ⋮⋮:
   Toggle minimap moving: true

2. Click en canvas:
   Canvas mousedown, minimapMoving: true
   Posicionando mini-mapa desde canvas click
   Posicionando mini-mapa: {
     clickX: 500,
     clickY: 300,
     newX: 200,
     newY: 150,
     wrapperWidth: 1200,
     wrapperHeight: 800
   }

3. Resultado:
   - Mini-mapa se mueve
   - Botón vuelve a ⋮⋮
   - Notificación: "Mini-mapa reposicionado"
```

---

**Última actualización**: 2026-02-07  
**Versión**: 2.0.0
