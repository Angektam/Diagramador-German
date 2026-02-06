# 🚀 Guía Rápida - Nuevas Funcionalidades

## 📖 Cómo Usar las Mejoras

### 1️⃣ Mini-mapa de Navegación

```
┌─────────────────────────────────────────┐
│  Canvas Principal                       │
│                                         │
│  [Formas aquí]                          │
│                                         │
│                          ┌──────────┐   │
│                          │ Mini-mapa│   │
│                          │  ┌────┐  │   │
│                          │  │ □  │  │   │ ← Click aquí
│                          │  └────┘  │   │   para navegar
│                          └──────────┘   │
└─────────────────────────────────────────┘
```

**Pasos:**
1. Mira el mini-mapa en la esquina inferior derecha
2. El rectángulo azul muestra tu vista actual
3. Click en cualquier parte del mini-mapa para saltar allí
4. Arrastra el rectángulo para mover la vista suavemente

---

### 2️⃣ Zoom con Rueda del Mouse

```
Antes:                    Después:
┌──────────┐             ┌────────────────┐
│  ┌─┐     │             │    ┌───┐       │
│  │□│     │  Ctrl+↑     │    │ □ │       │
│  └─┘     │  ======>    │    └───┘       │
│          │             │                │
└──────────┘             └────────────────┘
   100%                      150%
```

**Pasos:**
1. Mantén presionada la tecla `Ctrl`
2. Gira la rueda del mouse:
   - **Arriba** = Acercar (Zoom In)
   - **Abajo** = Alejar (Zoom Out)
3. Suelta `Ctrl` cuando termines

**Alternativa con botones:**
```
Toolbar: [−] [100%] [+] [⊙]
          ↓    ↓     ↓   ↓
       Alejar Ver Acercar Reset
```

---

### 3️⃣ Guías de Alineación

```
Arrastrando forma:          Guía aparece:
┌──────────────┐           ┌──────────────┐
│   ┌─┐        │           │   ┌─┐        │
│   │A│        │           │   │A│        │
│   └─┘        │           │   └─┘        │
│              │    →      │   ║          │ ← Guía vertical
│     ┌─┐      │           │   ║ ┌─┐      │
│     │B│      │           │   ║ │B│      │
│     └─┘      │           │   ║ └─┘      │
└──────────────┘           └──────────────┘
```

**Pasos:**
1. Arrastra una forma cerca de otra
2. Verás líneas azules cuando se alineen
3. La forma "saltará" a la posición alineada
4. Presiona `G` para activar/desactivar

**Tipos de alineación:**
- ⬅️ Borde izquierdo
- ➡️ Borde derecho
- ⬆️ Borde superior
- ⬇️ Borde inferior
- ⊕ Centro horizontal
- ⊕ Centro vertical

---

### 4️⃣ Selección Múltiple

```
Paso 1: Click normal        Paso 2: Ctrl+Click
┌──────────────┐            ┌──────────────┐
│   ┌─┐        │            │   ┏━┓        │
│   │A│ ←Click │            │   ┃A┃ ←Selec │
│   └─┘        │            │   ┗━┛        │
│              │            │              │
│     ┌─┐      │            │     ┏━┓      │
│     │B│      │            │     ┃B┃ ←Ctrl│
│     └─┘      │            │     ┗━┛ +Click│
└──────────────┘            └──────────────┘
   1 seleccionada              2 seleccionadas
```

**Pasos:**
1. Click en una forma (selección normal)
2. Mantén `Ctrl` y click en otra forma
3. Repite para agregar más formas
4. Arrastra cualquiera para mover todas juntas

**Atajos útiles:**
- `Ctrl + A` = Seleccionar todas
- `Escape` = Deseleccionar todas
- `Delete` = Eliminar seleccionadas

---

## 🎯 Flujo de Trabajo Típico

### Escenario: Organizar un diagrama desordenado

```
1. Vista general
   ┌─────────────────┐
   │ ┌─┐  ┌─┐  ┌─┐  │
   │ │A│  │B│  │C│  │  ← Formas desordenadas
   │ └─┘  └─┘  └─┘  │
   │  ┌─┐    ┌─┐    │
   │  │D│    │E│    │
   │  └─┘    └─┘    │
   └─────────────────┘

2. Usar mini-mapa para navegar
   [Click en mini-mapa] → Saltar a área de trabajo

3. Seleccionar múltiples formas
   Ctrl+Click en A, B, C

4. Mover con guías de alineación
   [Arrastar] → Guías aparecen → Alineación perfecta

5. Ajustar zoom para detalles
   Ctrl+Rueda → Acercar → Editar texto

6. Resultado final
   ┌─────────────────┐
   │ ┌─┐ ┌─┐ ┌─┐    │
   │ │A│ │B│ │C│    │  ← Perfectamente alineadas
   │ └─┘ └─┘ └─┘    │
   │ ┌─┐ ┌─┐        │
   │ │D│ │E│        │
   │ └─┘ └─┘        │
   └─────────────────┘
```

---

## 💡 Tips Pro

### 🎨 Diseño Rápido
```
1. Activa Snap to Grid (G)
2. Arrastra formas desde el panel
3. Las formas se alinean automáticamente
4. Resultado: Diagrama ordenado en segundos
```

### 🔍 Navegación Eficiente
```
1. Usa mini-mapa para vista general
2. Click para saltar entre secciones
3. Ctrl+Rueda para ajustar zoom
4. Trabaja en diferentes niveles de detalle
```

### ✏️ Edición Masiva
```
1. Ctrl+A para seleccionar todo
2. Arrastra para reposicionar todo el diagrama
3. O selecciona solo algunas con Ctrl+Click
4. Mueve grupos completos de una vez
```

### 📐 Alineación Perfecta
```
1. Arrastra una forma cerca de otra
2. Espera a ver la guía azul
3. Suelta cuando esté alineada
4. Repite para crear layouts profesionales
```

---

## ⚡ Atajos de Teclado - Cheat Sheet

```
╔════════════════════════════════════════════╗
║  ATAJOS DE TECLADO - CANVAS               ║
╠════════════════════════════════════════════╣
║  Ctrl + Click    │ Selección múltiple     ║
║  Ctrl + A        │ Seleccionar todo       ║
║  Escape          │ Deseleccionar          ║
║  Delete/Backsp   │ Eliminar selección     ║
║  G               │ Toggle Snap to Grid    ║
║  Ctrl + Rueda    │ Zoom in/out            ║
╚════════════════════════════════════════════╝
```

---

## 🎬 Ejemplos de Uso

### Ejemplo 1: Crear diagrama de base de datos
```
1. Arrastra tabla "usuarios" → Se alinea a grid
2. Arrastra tabla "pedidos" → Guía muestra alineación
3. Ctrl+Click en ambas → Selección múltiple
4. Arrastra juntas para reposicionar
5. Usa mini-mapa para ver todo el esquema
```

### Ejemplo 2: Organizar diagrama de flujo
```
1. Presiona G para activar snap to grid
2. Arrastra formas desde el panel
3. Las formas se alinean automáticamente cada 20px
4. Usa Ctrl+Rueda para acercar y editar texto
5. Ctrl+A para seleccionar todo y centrar
```

### Ejemplo 3: Revisar diagrama grande
```
1. Mira el mini-mapa para ubicarte
2. Click en diferentes áreas del mini-mapa
3. Salta rápidamente entre secciones
4. Usa Ctrl+Rueda para ajustar nivel de detalle
5. Navega eficientemente sin perderte
```

---

## 🐛 Solución de Problemas

### ❓ "No veo el mini-mapa"
- Verifica que estés en el editor (no en login/gallery)
- El mini-mapa está en la esquina inferior derecha
- Puede estar oculto si la ventana es muy pequeña

### ❓ "El zoom no funciona"
- Asegúrate de mantener presionada la tecla `Ctrl`
- Usa la rueda del mouse, no el trackpad (en algunos casos)
- Alternativamente usa los botones +/- en el toolbar

### ❓ "Las guías no aparecen"
- Presiona `G` para activar Snap to Grid
- Arrastra una forma cerca de otra (menos de 10px)
- Las guías solo aparecen durante el arrastre

### ❓ "No puedo seleccionar múltiples formas"
- Mantén presionada la tecla `Ctrl` (o `Cmd` en Mac)
- Click en cada forma que quieras agregar
- Verás un borde azul brillante en las seleccionadas

---

## 📊 Comparación Antes/Después

```
ANTES                          DESPUÉS
─────────────────────────────────────────────
❌ Navegación lenta            ✅ Mini-mapa rápido
❌ Zoom solo con botones       ✅ Ctrl+Rueda intuitivo
❌ Alineación manual           ✅ Guías automáticas
❌ Una forma a la vez          ✅ Selección múltiple
❌ Difícil organizar           ✅ Snap to grid
❌ Sin feedback visual         ✅ Guías y highlights
```

---

## 🎓 Aprende Más

- Ver `CANVAS_FEATURES.md` para detalles técnicos
- Ver `MEJORAS_IMPLEMENTADAS.md` para documentación completa
- Experimenta con las funcionalidades en el editor

---

**¡Disfruta las nuevas funcionalidades! 🎉**
