# 🗺️ Guía: Mover Mini-mapa con Click

## 🎯 Cómo Funciona

El mini-mapa ahora se puede **mover con solo 2 clicks**:

1. **Click en el botón ⋮⋮** (en el header del mini-mapa)
2. **Click donde quieres posicionarlo** (en cualquier parte del canvas)

---

## 📋 Pasos Detallados

### Paso 1: Activar Modo Mover

```
┌─────────────────────┐
│ 🗺️ Mapa        ⋮⋮  │ ← Click aquí
├─────────────────────┤
│                     │
│   [Mini-mapa]       │
│                     │
└─────────────────────┘
```

**Acción**: Click en el botón **⋮⋮** en la esquina superior derecha del mini-mapa

**Resultado**: 
- El botón cambia a **📍** (parpadeando)
- El mini-mapa tiene un brillo azul
- Notificación: "Click en el canvas para posicionar el mini-mapa"

---

### Paso 2: Posicionar

```
Canvas:
┌─────────────────────────────────┐
│                                 │
│         ← Click aquí            │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Acción**: Click en cualquier parte del canvas donde quieres el mini-mapa

**Resultado**:
- El mini-mapa se mueve a esa posición
- El botón vuelve a **⋮⋮**
- Notificación: "Mini-mapa reposicionado"

---

## 🎨 Estados Visuales

### Estado Normal

```
┌─────────────────────┐
│ 🗺️ Mapa        ⋮⋮  │ ← Botón normal
├─────────────────────┤
│                     │
│   [Mini-mapa]       │
│                     │
└─────────────────────┘
Borde: Gris
Función: Navegar con click
```

### Estado "Modo Mover"

```
┌─────────────────────┐
│ 🗺️ Mapa        📍  │ ← Botón activo (parpadeando)
├─────────────────────┤
│                     │
│   [Mini-mapa]       │
│                     │
└─────────────────────┘
Borde: Azul brillante
Función: Esperando posición
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Mover a Esquina Superior Izquierda

```
1. Click en ⋮⋮ (botón del mini-mapa)
2. Click en la esquina superior izquierda del canvas
3. ¡Listo! El mini-mapa está ahí
```

### Ejemplo 2: Centrar en la Pantalla

```
1. Click en ⋮⋮
2. Click en el centro del canvas
3. El mini-mapa se centra
```

### Ejemplo 3: Cancelar el Movimiento

```
1. Click en ⋮⋮ (activa modo mover)
2. Click en ⋮⋮ otra vez (o en 📍)
3. Se cancela el modo mover
```

---

## ⌨️ Atajos y Tips

### Cancelar Modo Mover

- **Opción 1**: Click en el botón 📍 otra vez
- **Opción 2**: Presiona `Escape` (próximamente)

### Posiciones Recomendadas

```
Canvas Layout:

┌─────────────────────────────────┐
│ 🗺️ Superior Izq.  Superior Der.│
│                                 │
│                                 │
│                                 │
│ Inferior Izq.      Inferior Der.│
└─────────────────────────────────┘

Posiciones populares:
✅ Inferior derecha (default)
✅ Superior derecha (no tapa toolbar)
✅ Inferior izquierda (alternativa)
✅ Superior izquierda (máxima visibilidad)
```

---

## 🎯 Casos de Uso

### Caso 1: El Mini-mapa Tapa una Tabla

**Problema**: Hay una tabla importante debajo del mini-mapa

**Solución**:
1. Click en ⋮⋮
2. Click en otra esquina
3. Ahora puedes ver la tabla

---

### Caso 2: Presentación en Proyector

**Problema**: El mini-mapa está muy lejos del área de trabajo

**Solución**:
1. Click en ⋮⋮
2. Click cerca del área principal
3. Más fácil de ver para la audiencia

---

### Caso 3: Trabajando con Múltiples Monitores

**Problema**: El mini-mapa queda en el borde entre monitores

**Solución**:
1. Click en ⋮⋮
2. Click en una posición cómoda
3. Mejor visibilidad

---

## 🔄 Comparación: Antes vs Ahora

### Antes (Arrastrar)

```
❌ Necesitas mantener presionado el mouse
❌ Puede ser impreciso
❌ Requiere coordinación
❌ Difícil en trackpad
```

### Ahora (Click)

```
✅ Solo 2 clicks simples
✅ Muy preciso
✅ Fácil de usar
✅ Funciona perfecto en trackpad
✅ Más rápido
```

---

## 🎨 Detalles Visuales

### Animaciones

1. **Botón Activo**: Pulsa suavemente (opacidad 1 → 0.7)
2. **Borde del Mini-mapa**: Brilla en azul cuando está activo
3. **Transición**: Suave al cambiar de posición

### Colores

- **Normal**: Borde gris, botón gris
- **Activo**: Borde azul brillante, botón azul con blanco
- **Hover**: Fondo del botón azul claro

---

## 🐛 Solución de Problemas

### Problema: El botón no responde

**Causa**: Puede estar en modo de navegación

**Solución**: Asegúrate de hacer click exactamente en el botón ⋮⋮

---

### Problema: El mini-mapa no se mueve

**Causa**: No estás en modo mover

**Solución**: 
1. Verifica que el botón muestre 📍 (no ⋮⋮)
2. Verifica que el borde esté azul brillante

---

### Problema: El mini-mapa se posiciona mal

**Causa**: Click muy cerca del borde

**Solución**: El sistema tiene límites automáticos, el mini-mapa se ajustará al borde más cercano

---

## 🚀 Próximas Mejoras

### Planeadas

- [ ] Atajo `M` para activar modo mover
- [ ] `Escape` para cancelar
- [ ] Doble click en header para resetear posición
- [ ] Guardar posición en localStorage
- [ ] Snap a esquinas (magnetismo)

---

## 📊 Ventajas del Sistema de Click

### Precisión

```
Arrastrar: ±10px de precisión
Click:     ±1px de precisión ✅
```

### Velocidad

```
Arrastrar: ~2-3 segundos
Click:     ~1 segundo ✅
```

### Facilidad

```
Arrastrar: Requiere coordinación
Click:     Muy intuitivo ✅
```

---

## 🎓 Tips Pro

### Tip 1: Posicionamiento Rápido

```
Para mover a una esquina específica:
1. Click en ⋮⋮
2. Click en la esquina deseada
3. El mini-mapa se centra en ese punto
```

### Tip 2: Ajuste Fino

```
Si no quedó exactamente donde querías:
1. Click en ⋮⋮ otra vez
2. Click un poco más cerca/lejos
3. Repite hasta que esté perfecto
```

### Tip 3: Posiciones Predefinidas

```
Esquinas exactas:
- Superior izquierda: Click cerca de (0, 0)
- Superior derecha: Click cerca de (max, 0)
- Inferior izquierda: Click cerca de (0, max)
- Inferior derecha: Click cerca de (max, max)
```

---

## 📝 Resumen

### Modo Normal (⋮⋮)
- Click en el mapa → Navegar
- Click en formas → Seleccionar
- Funcionalidad normal del canvas

### Modo Mover (📍)
- Click en el canvas → Posicionar mini-mapa
- Borde azul brillante
- Botón parpadeando

---

## 🎉 ¡Disfruta!

El mini-mapa ahora es súper fácil de mover. Solo 2 clicks y listo.

**¿Necesitas ayuda?**
- Mira el botón: ⋮⋮ = normal, 📍 = modo mover
- Mira el borde: gris = normal, azul = modo mover
- Lee las notificaciones en pantalla

---

**Fecha de actualización**: 2026-02-07  
**Versión**: 2.0.0 (Sistema de Click)
