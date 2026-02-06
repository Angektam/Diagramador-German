# 🧪 Instrucciones de Prueba - Nuevas Funcionalidades

## 🎯 Objetivo
Verificar que todas las nuevas funcionalidades del canvas funcionan correctamente.

---

## ✅ Checklist de Pruebas

### 1. 🗺️ Mini-mapa de Navegación

#### Test 1.1: Visualización
- [ ] El mini-mapa aparece en la esquina inferior derecha
- [ ] Tiene un fondo oscuro semi-transparente
- [ ] Muestra todas las formas del canvas
- [ ] El rectángulo de viewport es visible

#### Test 1.2: Navegación por Click
1. Crea varias formas en diferentes áreas del canvas
2. Click en diferentes partes del mini-mapa
3. **Resultado esperado**: El canvas salta a esa posición

#### Test 1.3: Drag en Mini-mapa
1. Click y mantén presionado en el mini-mapa
2. Arrastra el mouse
3. **Resultado esperado**: El viewport se mueve suavemente

#### Test 1.4: Actualización Automática
1. Haz scroll en el canvas principal
2. Observa el mini-mapa
3. **Resultado esperado**: El rectángulo de viewport se actualiza

#### Test 1.5: Formas Seleccionadas
1. Selecciona una o más formas
2. Observa el mini-mapa
3. **Resultado esperado**: Las formas seleccionadas aparecen en azul

---

### 2. 🔍 Zoom con Rueda del Mouse

#### Test 2.1: Zoom In
1. Mantén presionada la tecla `Ctrl`
2. Gira la rueda del mouse hacia arriba
3. **Resultado esperado**: El zoom aumenta en incrementos de 10%

#### Test 2.2: Zoom Out
1. Mantén presionada la tecla `Ctrl`
2. Gira la rueda del mouse hacia abajo
3. **Resultado esperado**: El zoom disminuye en incrementos de 10%

#### Test 2.3: Límites de Zoom
1. Intenta hacer zoom más allá del 200%
2. Intenta hacer zoom menos del 25%
3. **Resultado esperado**: El zoom se detiene en los límites

#### Test 2.4: Indicador Visual
1. Cambia el nivel de zoom
2. Observa el toolbar
3. **Resultado esperado**: El porcentaje se actualiza en tiempo real

#### Test 2.5: Botones de Zoom
1. Click en el botón `+` del toolbar
2. Click en el botón `-` del toolbar
3. Click en el botón `⊙` (reset)
4. **Resultado esperado**: 
   - `+` aumenta 10%
   - `-` disminuye 10%
   - `⊙` vuelve a 100%

#### Test 2.6: Mini-mapa con Zoom
1. Cambia el nivel de zoom
2. Observa el mini-mapa
3. **Resultado esperado**: El viewport se actualiza correctamente

---

### 3. 📏 Guías de Alineación (Snap to Grid)

#### Test 3.1: Snap to Grid Básico
1. Presiona `G` para activar (si no está activo)
2. Arrastra una forma
3. **Resultado esperado**: La forma se alinea a la cuadrícula de 20px

#### Test 3.2: Toggle Snap to Grid
1. Presiona `G`
2. Observa la notificación
3. Arrastra una forma
4. Presiona `G` de nuevo
5. Arrastra otra forma
6. **Resultado esperado**: 
   - Notificación muestra "ON" o "OFF"
   - Con ON: forma se alinea
   - Con OFF: forma se mueve libremente

#### Test 3.3: Guías Horizontales
1. Crea dos formas, una arriba de la otra
2. Arrastra la forma superior cerca de la inferior
3. **Resultado esperado**: Aparece una línea azul horizontal cuando se alinean

#### Test 3.4: Guías Verticales
1. Crea dos formas, una al lado de la otra
2. Arrastra una forma cerca de la otra
3. **Resultado esperado**: Aparece una línea azul vertical cuando se alinean

#### Test 3.5: Alineación por Centro
1. Crea dos formas de diferentes tamaños
2. Arrastra una cerca de la otra
3. **Resultado esperado**: Guías aparecen al alinear centros (horizontal y vertical)

#### Test 3.6: Alineación por Bordes
1. Crea dos formas
2. Arrastra una para alinear:
   - Borde izquierdo con borde izquierdo
   - Borde derecho con borde derecho
   - Borde superior con borde superior
   - Borde inferior con borde inferior
3. **Resultado esperado**: Guías aparecen en cada caso

#### Test 3.7: Desaparición de Guías
1. Arrastra una forma hasta que aparezca una guía
2. Suelta el mouse
3. **Resultado esperado**: La guía desaparece inmediatamente

---

### 4. ✅ Selección Múltiple

#### Test 4.1: Selección Simple
1. Click en una forma
2. **Resultado esperado**: 
   - Forma tiene borde azul brillante
   - Efecto glow visible
   - Toolbar muestra "1 seleccionada(s)"

#### Test 4.2: Agregar a Selección
1. Click en una forma
2. Mantén `Ctrl` y click en otra forma
3. Mantén `Ctrl` y click en una tercera forma
4. **Resultado esperado**: 
   - Todas tienen borde azul
   - Toolbar muestra "3 seleccionada(s)"

#### Test 4.3: Quitar de Selección
1. Selecciona 3 formas con `Ctrl + Click`
2. Mantén `Ctrl` y click en una forma ya seleccionada
3. **Resultado esperado**: 
   - Esa forma se deselecciona
   - Toolbar muestra "2 seleccionada(s)"

#### Test 4.4: Mover Múltiples Formas
1. Selecciona 3 formas con `Ctrl + Click`
2. Arrastra cualquiera de ellas
3. **Resultado esperado**: Todas las formas se mueven juntas

#### Test 4.5: Seleccionar Todo
1. Crea varias formas
2. Presiona `Ctrl + A`
3. **Resultado esperado**: 
   - Todas las formas se seleccionan
   - Notificación: "Todas las formas seleccionadas"

#### Test 4.6: Deseleccionar Todo
1. Selecciona varias formas
2. Presiona `Escape`
3. **Resultado esperado**: 
   - Todas las formas se deseleccionan
   - Toolbar no muestra contador

#### Test 4.7: Deseleccionar con Click
1. Selecciona varias formas con `Ctrl + Click`
2. Click en el canvas (no en una forma) sin `Ctrl`
3. **Resultado esperado**: Todas las formas se deseleccionan

#### Test 4.8: Eliminar Múltiples Formas
1. Selecciona 3 formas con `Ctrl + Click`
2. Presiona `Delete` o `Backspace`
3. **Resultado esperado**: 
   - Las 3 formas se eliminan
   - Notificación: "3 forma(s) eliminada(s)"

#### Test 4.9: Selección con Snap to Grid
1. Activa snap to grid con `G`
2. Selecciona múltiples formas
3. Arrastra el grupo
4. **Resultado esperado**: El grupo se mueve con snap to grid activo

#### Test 4.10: Selección en Mini-mapa
1. Selecciona varias formas
2. Observa el mini-mapa
3. **Resultado esperado**: Las formas seleccionadas aparecen en azul

---

## 🔄 Pruebas de Integración

### Test I.1: Zoom + Mini-mapa
1. Cambia el zoom a 150%
2. Usa el mini-mapa para navegar
3. **Resultado esperado**: Navegación funciona correctamente con zoom

### Test I.2: Selección Múltiple + Guías
1. Selecciona 2 formas con `Ctrl + Click`
2. Arrastra el grupo cerca de otra forma
3. **Resultado esperado**: Guías de alineación aparecen

### Test I.3: Zoom + Snap to Grid
1. Cambia el zoom a 50%
2. Arrastra una forma
3. **Resultado esperado**: Snap to grid funciona en cualquier nivel de zoom

### Test I.4: Todo Junto
1. Crea 5 formas
2. Usa `Ctrl + A` para seleccionar todas
3. Arrastra el grupo con guías activas
4. Usa el mini-mapa para navegar
5. Cambia el zoom con `Ctrl + Rueda`
6. **Resultado esperado**: Todas las funcionalidades trabajan en armonía

---

## 🎨 Pruebas Visuales

### Test V.1: Formas Seleccionadas
- [ ] Borde azul brillante (3px)
- [ ] Efecto glow/resplandor visible
- [ ] Transición suave al seleccionar

### Test V.2: Guías de Alineación
- [ ] Líneas azules semi-transparentes
- [ ] Visibles solo durante el arrastre
- [ ] Se ocultan al soltar

### Test V.3: Mini-mapa
- [ ] Fondo oscuro con blur
- [ ] Formas en gris
- [ ] Formas seleccionadas en azul
- [ ] Viewport con borde azul

### Test V.4: Indicadores en Toolbar
- [ ] Porcentaje de zoom actualizado
- [ ] Contador de selección visible
- [ ] Botones con hover effects

---

## 🐛 Pruebas de Edge Cases

### Test E.1: Sin Formas
1. Canvas vacío
2. Presiona `Ctrl + A`
3. **Resultado esperado**: Nada sucede, sin errores

### Test E.2: Una Sola Forma
1. Crea una forma
2. Presiona `Ctrl + A`
3. **Resultado esperado**: La forma se selecciona

### Test E.3: Zoom Extremo
1. Zoom al 25%
2. Intenta usar todas las funcionalidades
3. Zoom al 200%
4. Intenta usar todas las funcionalidades
5. **Resultado esperado**: Todo funciona en ambos extremos

### Test E.4: Muchas Formas
1. Crea 50+ formas
2. Usa `Ctrl + A` para seleccionar todas
3. Arrastra el grupo
4. **Resultado esperado**: Performance aceptable, sin lag

### Test E.5: Formas Superpuestas
1. Crea 3 formas en el mismo lugar
2. Intenta seleccionar cada una
3. **Resultado esperado**: Puedes seleccionar cada forma individualmente

---

## ⌨️ Pruebas de Atajos

### Test A.1: Todos los Atajos
- [ ] `Ctrl + Click` - Selección múltiple
- [ ] `Ctrl + A` - Seleccionar todo
- [ ] `Escape` - Deseleccionar
- [ ] `Delete` - Eliminar
- [ ] `Backspace` - Eliminar
- [ ] `G` - Toggle Snap to Grid
- [ ] `Ctrl + Rueda` - Zoom

### Test A.2: Atajos en Secuencia
1. `Ctrl + A` (seleccionar todo)
2. `Escape` (deseleccionar)
3. `Ctrl + Click` en 3 formas
4. `G` (toggle snap)
5. Arrastra el grupo
6. `Delete` (eliminar)
7. **Resultado esperado**: Cada atajo funciona correctamente

---

## 📱 Pruebas de Responsividad

### Test R.1: Ventana Pequeña
1. Reduce el tamaño de la ventana
2. Verifica que el mini-mapa siga visible
3. **Resultado esperado**: Mini-mapa se adapta o se oculta apropiadamente

### Test R.2: Ventana Grande
1. Maximiza la ventana
2. Verifica todas las funcionalidades
3. **Resultado esperado**: Todo funciona correctamente

---

## 🔍 Pruebas de Performance

### Test P.1: Tiempo de Respuesta
1. Crea 20 formas
2. Selecciona todas con `Ctrl + A`
3. Arrastra el grupo
4. **Resultado esperado**: Movimiento suave, sin lag

### Test P.2: Mini-mapa con Muchas Formas
1. Crea 100 formas
2. Observa el mini-mapa
3. **Resultado esperado**: Mini-mapa se renderiza correctamente

### Test P.3: Zoom Rápido
1. Usa `Ctrl + Rueda` rápidamente
2. **Resultado esperado**: Zoom responde sin delay

---

## 📊 Reporte de Resultados

### Formato de Reporte
```
Funcionalidad: [Nombre]
Test: [Número y Descripción]
Estado: [✅ Pasó / ❌ Falló / ⚠️ Parcial]
Notas: [Observaciones]
```

### Ejemplo
```
Funcionalidad: Mini-mapa
Test: 1.1 - Visualización
Estado: ✅ Pasó
Notas: Mini-mapa aparece correctamente en la esquina inferior derecha
```

---

## 🎯 Criterios de Aceptación

Para considerar las mejoras como exitosas, deben cumplirse:

- [ ] Todos los tests básicos (1.1-4.10) pasan
- [ ] Al menos 80% de tests de integración pasan
- [ ] Todos los tests visuales pasan
- [ ] No hay errores en consola
- [ ] Performance aceptable (sin lag notable)
- [ ] Funciona en Chrome, Firefox y Edge

---

## 🚀 Próximos Pasos Después de las Pruebas

1. **Si todo pasa**: 
   - Marcar como listo para producción
   - Actualizar documentación de usuario
   - Crear release notes

2. **Si hay fallos menores**:
   - Documentar los issues
   - Priorizar fixes
   - Re-testear después de correcciones

3. **Si hay fallos mayores**:
   - Rollback si es necesario
   - Análisis de root cause
   - Plan de corrección

---

**Fecha de creación**: 2026-02-06  
**Versión**: 1.0  
**Tester**: [Tu nombre]
