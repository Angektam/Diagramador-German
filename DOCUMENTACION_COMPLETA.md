# Documentación Completa - Diagramador SQL

## Índice
1. [Introducción](#introducción)
2. [Arquitectura de la Aplicación](#arquitectura-de-la-aplicación)
3. [Flujo de Usuario](#flujo-de-usuario)
4. [Componentes Principales](#componentes-principales)
5. [Guía Rápida](#guía-rápida)
6. [Características Principales](#características-principales)
7. [Asistente de Diagramas](#asistente-de-diagramas)
8. [Canvas y Controles](#canvas-y-controles)
9. [Validaciones](#validaciones)
10. [Mejoras Implementadas](#mejoras-implementadas)

---

## Introducción

### ¿Qué es Diagramador SQL?

Diagramador SQL es una aplicación web moderna para crear, editar y gestionar diagramas de bases de datos de forma visual e intuitiva. Permite a desarrolladores, arquitectos de datos y estudiantes diseñar esquemas de bases de datos sin necesidad de escribir código SQL manualmente.

### Características Clave

- **Visual**: Arrastra y suelta formas para crear diagramas
- **Inteligente**: Asistente con IA que genera bases de datos automáticamente
- **Flexible**: Soporta múltiples tipos de diagramas (ER, UML, Flujo)
- **Productivo**: Atajos de teclado y herramientas de alineación
- **Seguro**: Validaciones completas y prevención de XSS
- **Responsive**: Funciona en desktop, tablet y móvil

---

## Arquitectura de la Aplicación

### Stack Tecnológico

```
Frontend: Angular 17 (Standalone Components)
├── TypeScript 5.x
├── RxJS (Signals para reactividad)
├── SVG (Renderizado de formas)
└── CSS Variables (Theming)

Estructura:
├── Components (UI)
├── Services (Lógica de negocio)
├── Models (Tipos e interfaces)
└── Guards (Protección de rutas)
```

### Patrón de Diseño

La aplicación sigue el patrón **Component-Service**:

- **Components**: Manejan la UI y eventos del usuario
- **Services**: Contienen la lógica de negocio y estado
- **Signals**: Reactividad automática sin subscripciones manuales
- **Standalone**: No requiere NgModules, más modular

### Estado de la Aplicación

El estado se gestiona mediante **Signals** en servicios:

```typescript
DiagramService
├── shapes: Signal<DiagramShape[]>
├── connections: Signal<Connection[]>
├── selectedShapeIds: Signal<string[]>
├── zoomLevel: Signal<number>
└── connectingFromShapeId: Signal<string | null>

AuthService
├── currentUser: Signal<User | null>
└── isAuthenticated: Signal<boolean>
```

---

## Flujo de Usuario

### 1. Autenticación (Login)

```
Usuario → Login Component
    ↓
Validación de credenciales
    ↓
AuthService.login()
    ↓
Guard verifica autenticación
    ↓
Redirección a /editor
```

**Credenciales Demo**:
- Admin: `admin` / `admin123` (acceso completo)
- Usuario: `usuario` / `123456` (acceso estándar)
- Demo: `demo` / `demo` (acceso limitado)

### 2. Creación de Diagrama

#### Opción A: Manual (Drag & Drop)

```
Usuario arrastra forma desde panel
    ↓
onDragStart() captura datos
    ↓
onDrop() en canvas
    ↓
Validación de posición
    ↓
DiagramService.addShape()
    ↓
Renderizado automático (Signals)
```

#### Opción B: Importación SQL

```
Usuario pega código SQL
    ↓
Regex extrae CREATE TABLE
    ↓
Parser detecta columnas y FK
    ↓
Generación de formas
    ↓
Creación de conexiones
    ↓
Renderizado en canvas
```

#### Opción C: Asistente Inteligente

```
Usuario describe BD en lenguaje natural
    ↓
ChatAssistantService.processCommand()
    ↓
Detección de dominio (ventas, educación, etc.)
    ↓
Generación de tablas apropiadas
    ↓
Creación automática de relaciones
    ↓
Generación de código SQL
```

### 3. Edición de Diagrama

```
Usuario selecciona forma
    ↓
onShapeMouseDown()
    ↓
Tracking de movimiento
    ↓
Validación de límites
    ↓
Snap to grid (opcional)
    ↓
Guías de alineación
    ↓
DiagramService.updateShape()
```

### 4. Guardado y Exportación

```
Usuario guarda diagrama
    ↓
DiagramService.saveToGallery()
    ↓
Serialización a JSON
    ↓
LocalStorage
    ↓
Disponible en galería
```

---

## Componentes Principales

### 1. Login Component

**Ubicación**: `src/app/components/login/login.component.ts`

**Responsabilidades**:
- Autenticación de usuarios
- Registro de nuevos usuarios
- Validación de formularios
- Gestión de sesión

**Características**:
- Tabs para Login/Registro
- Validación en tiempo real
- Indicador de fortaleza de contraseña
- Botones de credenciales demo
- Animaciones suaves

**Validaciones**:
- Usuario: 3-50 caracteres
- Email: Formato válido
- Contraseña: 4-100 caracteres
- Prevención XSS

### 2. Canvas Component

**Ubicación**: `src/app/components/canvas/canvas.component.ts`

**Responsabilidades**:
- Renderizado de formas SVG
- Gestión de interacciones (drag, zoom, pan)
- Minimapa
- Guías de alineación
- Copiar/Pegar

**Estructura**:
```html
<canvas-wrapper>
  <canvas-container (zoom aplicado)>
    <svg class="canvas-grid"> <!-- Grid de puntos -->
    <svg class="canvas-svg">
      <g id="connections-layer"> <!-- Líneas de conexión -->
      <g id="shapes-layer"> <!-- Formas del diagrama -->
    </svg>
  </canvas-container>
  <minimap> <!-- Minimapa arrastrable -->
</canvas-wrapper>
```

**Eventos Manejados**:
- `mousedown`: Selección y arrastre
- `wheel`: Zoom y scroll
- `drop`: Agregar formas
- `touchstart/move/end`: Soporte táctil
- `keydown`: Atajos de teclado

### 3. Toolbar Component

**Ubicación**: `src/app/components/toolbar/toolbar.component.ts`

**Responsabilidades**:
- Acciones principales (Nuevo, Guardar, Exportar)
- Control de zoom
- Abrir modales (SQL, Plantillas, Galería)
- Abrir asistente
- Logout

**Botones**:
- 🏠 Nuevo diagrama
- 💾 Guardar
- 📥 Importar SQL
- 📤 Exportar SQL
- 🎨 Plantillas
- 🖼️ Galería
- 🧙‍♂️ Asistente
- 🔍 Zoom +/-
- 👤 Usuario/Logout

### 4. Shapes Panel Component

**Ubicación**: `src/app/components/shapes-panel/shapes-panel.component.ts`

**Responsabilidades**:
- Mostrar catálogo de formas
- Drag & Drop de formas
- Categorización (BD, ER, UML, Flujo)
- Búsqueda de formas

**Categorías**:
- **Database**: Table, View, Procedure, Function, etc.
- **ER Diagram**: Entity, Relationship, Attribute, etc.
- **UML**: Class, Interface, Actor, Use Case, etc.
- **Flowchart**: Rect, Diamond, Ellipse, Arrow, etc.

### 5. Chat Assistant Component

**Ubicación**: `src/app/components/chat-assistant/chat-assistant.component.ts`

**Responsabilidades**:
- Interfaz de chat
- Procesamiento de comandos
- Sugerencias contextuales
- Integración con Wizard

**Estructura**:
```html
<modal-overlay>
  <modal>
    <header> <!-- Título y botón cerrar -->
    <tabs> <!-- Chat | Wizard -->
    <messages-container> <!-- Historial de chat -->
    <input-area> <!-- Input + botón enviar -->
  </modal>
</modal-overlay>
```

**Flujo de Mensaje**:
```
Usuario escribe mensaje
    ↓
Validación (longitud, XSS)
    ↓
ChatAssistantService.processCommand()
    ↓
Detección de comando
    ↓
Ejecución de acción
    ↓
Respuesta con sugerencias
```

### 6. Diagram Wizard Component

**Ubicación**: `src/app/components/diagram-wizard/diagram-wizard.component.ts`

**Responsabilidades**:
- Asistente paso a paso
- Generación guiada de diagramas
- Formularios dinámicos
- Validación de entrada

**Pasos**:
1. Selección de tipo de diagrama
2. Configuración básica
3. Definición de entidades
4. Relaciones
5. Generación final

### 7. Templates Modal Component

**Ubicación**: `src/app/components/templates-modal/templates-modal.component.ts`

**Responsabilidades**:
- Mostrar plantillas predefinidas
- Previsualización
- Carga de plantilla al canvas

**Plantillas Disponibles**:
- E-commerce básico
- Blog con usuarios
- Sistema de inventario
- Gestión de empleados
- Sistema académico

### 8. Map Gallery Component

**Ubicación**: `src/app/components/map-gallery/map-gallery.component.ts`

**Responsabilidades**:
- Listar diagramas guardados
- Cargar diagrama
- Eliminar diagrama
- Búsqueda y filtrado

**Almacenamiento**:
- LocalStorage del navegador
- Formato JSON
- Metadatos (nombre, fecha, usuario)

---

## Servicios Principales

### 1. DiagramService

**Ubicación**: `src/app/services/diagram.service.ts`

**Estado Gestionado**:
```typescript
shapes: Signal<DiagramShape[]>
connections: Signal<Connection[]>
selectedShapeIds: Signal<string[]>
zoomLevel: Signal<number>
connectingFromShapeId: Signal<string | null>
```

**Métodos Principales**:
- `addShape(shape)`: Agregar forma al diagrama
- `updateShape(id, updates)`: Actualizar propiedades
- `deleteShape(id)`: Eliminar forma
- `addConnection(fromId, toId)`: Crear conexión
- `selectShape(id)`: Seleccionar forma
- `setZoom(level)`: Ajustar zoom
- `saveToGallery(name)`: Guardar diagrama
- `loadFromGallery(id)`: Cargar diagrama

### 2. ChatAssistantService

**Ubicación**: `src/app/services/chat-assistant.service.ts`

**Responsabilidades**:
- Procesamiento de lenguaje natural
- Detección de comandos
- Generación automática de BD
- Inferencia de tablas por dominio

**Comandos Soportados**:
```typescript
{
  createTable: ['crear tabla', 'nueva tabla'],
  importSql: ['importar sql', 'cargar sql'],
  newDiagram: ['nuevo diagrama', 'limpiar todo'],
  save: ['guardar', 'save'],
  zoom: ['zoom', 'acercar', 'alejar'],
  stats: ['estadísticas', 'info'],
  help: ['ayuda', 'help'],
  createDatabase: ['crea una base de datos de...']
}
```

**Generación Inteligente**:
```typescript
inferTablesFromDescription(description: string)
    ↓
Detecta dominio (ventas, educación, salud, etc.)
    ↓
Selecciona plantilla apropiada
    ↓
Genera tablas con columnas
    ↓
Crea relaciones (FK)
    ↓
Retorna estructura completa
```

### 3. AuthService

**Ubicación**: `src/app/services/auth.service.ts`

**Responsabilidades**:
- Autenticación de usuarios
- Gestión de sesión
- Registro de usuarios
- Verificación de permisos

**Usuarios Demo**:
```typescript
{
  admin: { password: 'admin123', role: 'admin' },
  usuario: { password: '123456', role: 'user' },
  demo: { password: 'demo', role: 'demo' }
}
```

### 4. NotificationService

**Ubicación**: `src/app/services/notification.service.ts`

**Responsabilidades**:
- Mostrar notificaciones toast
- Tipos: success, error, warning, info
- Auto-dismiss configurable
- Cola de notificaciones

**Uso**:
```typescript
notifications.success('Operación exitosa');
notifications.error('Error al guardar');
notifications.warning('Límite alcanzado');
notifications.info('Información útil');
```

---

## Guía Rápida

### Inicio Rápido

#### 1. Acceso a la Aplicación
1. Abre el navegador en `http://localhost:4200`
2. Verás la pantalla de login con diseño moderno
3. Usa credenciales demo o regístrate

#### 2. Primera Vez en el Editor
Al entrar verás:
- **Izquierda**: Panel de formas (arrastrables)
- **Centro**: Canvas (área de trabajo)
- **Arriba**: Toolbar con acciones
- **Abajo-derecha**: Minimapa

#### 3. Crear tu Primer Diagrama

**Método 1: Drag & Drop**
```
1. Arrastra "Table" desde el panel izquierdo
2. Suelta en el canvas
3. Doble-click para editar
4. Agrega columnas
5. Repite para más tablas
6. Click en "Conectar" y une tablas
```

**Método 2: Importar SQL**
```
1. Click en "Importar SQL" (toolbar)
2. Pega tu código CREATE TABLE
3. Click "Importar"
4. Las tablas aparecen automáticamente
5. Las relaciones se crean solas
```

**Método 3: Asistente Inteligente**
```
1. Click en 🧙‍♂️ (toolbar)
2. Escribe: "Crea una base de datos de tienda de ropa"
3. El asistente genera todo automáticamente
4. Revisa y ajusta según necesites
```

### Atajos de Teclado

#### Selección
- `Click` - Seleccionar forma
- `Ctrl+Click` - Multi-selección
- `Ctrl+A` - Seleccionar todo
- `Escape` - Deseleccionar todo

#### Edición
- `Ctrl+C` - Copiar formas seleccionadas
- `Ctrl+V` - Pegar formas
- `Ctrl+D` - Duplicar formas
- `Delete/Backspace` - Eliminar selección

#### Navegación
- `Space + Drag` - Panning temporal
- `Ctrl+Wheel` - Zoom in/out
- `Shift+Wheel` - Scroll horizontal
- `Wheel` - Scroll vertical

#### Utilidades
- `G` - Toggle snap to grid
- `Doble-click` - Editar forma

### Flujo de Trabajo Típico

```
1. Login con credenciales
    ↓
2. Nuevo diagrama o cargar existente
    ↓
3. Agregar formas (drag & drop o importar)
    ↓
4. Editar propiedades (doble-click)
    ↓
5. Crear conexiones (botón conectar)
    ↓
6. Ajustar posiciones (drag)
    ↓
7. Guardar diagrama (toolbar)
    ↓
8. Exportar SQL si necesario
```

---

## Características Principales

### 1. Canvas Ilimitado

**Descripción**: Área de trabajo de 10000x10000 píxeles para diagramas grandes.

**Características**:
- **Tamaño**: 10000x10000 píxeles (suficiente para cientos de tablas)
- **Scrollbars**: Siempre visibles para navegación intuitiva
- **Grid**: Puntos cada 20px para alineación visual
- **Viewport**: Área visible ajustable con zoom

**Navegación**:
```
Panning (arrastrar canvas):
├── Click derecho + drag
├── Shift + Click izquierdo + drag
├── Botón central del mouse + drag
└── Space + drag (temporal)

Scroll:
├── Wheel vertical (arriba/abajo)
├── Shift+Wheel (izquierda/derecha)
└── Trackpad (2 dedos, todas direcciones)

Zoom:
├── Ctrl+Wheel (zoom in/out)
├── Botones +/- en toolbar
└── Pinch en dispositivos táctiles
```

**Inercia de Panning**:
- Al soltar después de arrastrar, el canvas continúa moviéndose
- Fricción gradual (estilo draw.io)
- Velocidad proporcional al movimiento
- Cancelable con cualquier interacción

**Límites**:
- Área útil: 0-9800 píxeles (margen de seguridad)
- Advertencia si formas están fuera del área
- Validación automática al pegar

### 2. Minimapa Interactivo

**Descripción**: Vista miniatura del diagrama completo con navegación rápida.

**Ubicación**: Esquina inferior derecha (arrastrable)

**Características**:
- **Viewport**: Rectángulo morado muestra área visible
- **Formas**: Todas las formas del diagrama en miniatura
- **Selección**: Formas seleccionadas en color accent
- **Arrastrable**: Mueve el minimapa a cualquier posición

**Interacciones**:
```
Click en minimapa:
├── Salta a esa posición del canvas
└── Centra el viewport en el punto clickeado

Arrastrar header:
├── Mueve el minimapa por la pantalla
├── Se mantiene dentro de límites
└── Posición persistente durante sesión

Arrastrar viewport:
├── Mueve el canvas en tiempo real
└── Navegación precisa
```

**ViewBox Dinámico**:
- Se ajusta automáticamente al contenido
- Padding de 200px alrededor de formas
- Mínimo 2000x2000 píxeles
- Actualización en tiempo real

### 3. Importación SQL

**Descripción**: Convierte código SQL en diagramas visuales automáticamente.

**Sintaxis Soportadas**:
```sql
-- Básica
CREATE TABLE usuarios (
  id INT PRIMARY KEY,
  nombre VARCHAR(100)
);

-- Con AUTO_INCREMENT
CREATE TABLE productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL
);

-- Con FOREIGN KEY inline
CREATE TABLE pedidos (
  id INT PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id)
);

-- Con FOREIGN KEY separada
CREATE TABLE detalles (
  id INT PRIMARY KEY,
  pedido_id INT,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- Con ALTER TABLE
CREATE TABLE items (
  id INT PRIMARY KEY,
  categoria_id INT
);
ALTER TABLE items ADD FOREIGN KEY (categoria_id) REFERENCES categorias(id);

-- Con CONSTRAINT nombrado
CREATE TABLE ventas (
  id INT PRIMARY KEY,
  cliente_id INT,
  CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

**Proceso de Importación**:
```
1. Usuario pega código SQL
    ↓
2. Regex extrae CREATE TABLE statements
    ↓
3. Parser identifica:
   ├── Nombre de tabla
   ├── Columnas (nombre, tipo)
   ├── PRIMARY KEY
   └── FOREIGN KEY
    ↓
4. Generación de formas:
   ├── Posición automática (grid 3 columnas)
   ├── Tamaño según número de columnas
   └── Colores por tipo
    ↓
5. Creación de conexiones:
   ├── Detecta FK en columnas
   ├── Busca tabla referenciada
   └── Crea línea de conexión
    ↓
6. Renderizado en canvas
```

**Detección de Relaciones**:
- `REFERENCES tabla(columna)` - FK inline
- `FOREIGN KEY (col) REFERENCES tabla(col)` - FK separada
- `ALTER TABLE ... ADD FOREIGN KEY` - FK posterior
- `CONSTRAINT nombre FOREIGN KEY` - FK nombrada

**Validaciones**:
- Verifica sintaxis básica
- Detecta tablas duplicadas
- Valida referencias a tablas existentes
- Maneja espacios y saltos de línea
- Ignora comentarios SQL

### 4. Copiar/Pegar

**Descripción**: Duplica formas rápidamente con atajos de teclado.

**Funcionalidades**:

#### Copiar (Ctrl+C)
```
1. Selecciona una o más formas
2. Presiona Ctrl+C
3. Deep clone de formas al clipboard
4. Incluye tableData completo
5. Notificación de confirmación
```

#### Pegar (Ctrl+V)
```
1. Presiona Ctrl+V
2. Formas se pegan en centro del viewport
3. IDs únicos generados automáticamente
4. Offset de 30px respecto al original
5. Formas pegadas quedan seleccionadas
```

#### Duplicar (Ctrl+D)
```
1. Selecciona formas
2. Presiona Ctrl+D
3. Copia y pega en un solo paso
4. Más rápido que Ctrl+C + Ctrl+V
```

**Multi-selección**:
```
Ctrl+Click: Agregar/quitar de selección
Ctrl+A: Seleccionar todas las formas
Escape: Deseleccionar todo
```

**Límites**:
- Máximo 100 formas por operación de copiar/pegar
- Máximo 500 formas totales en diagrama
- Validación de límites del canvas
- Notificaciones si se exceden límites

**Posicionamiento Inteligente**:
- Calcula centro de formas copiadas
- Pega en centro del viewport actual
- Mantiene distancias relativas
- Ajusta si está fuera de límites

### 5. Alineación y Grid

**Descripción**: Herramientas para organizar formas de manera profesional.

#### Snap to Grid
```
Estado: ON/OFF (toggle con tecla G)
Tamaño: 20x20 píxeles
Efecto: Formas se ajustan a puntos del grid
Uso: Alineación rápida y consistente
```

#### Guías de Alineación
```
Aparecen al mover formas
Detectan alineación con otras formas:
├── Borde izquierdo
├── Centro horizontal
├── Borde derecho
├── Borde superior
├── Centro vertical
└── Borde inferior

Threshold: 10 píxeles
Color: Accent (morado)
Duración: Mientras se arrastra
```

#### Alineación Automática
```
Al mover una forma cerca de otra:
1. Detecta proximidad (< 10px)
2. Calcula punto de alineación
3. Ajusta posición automáticamente
4. Muestra guía visual
5. Snap suave (no brusco)
```

**Visualización del Grid**:
- Puntos cada 20px
- Color: rgba(100, 116, 139, 0.4)
- Radio: 1.5px
- Espaciado doble (40px) para claridad
- Cubre todo el canvas (10000x10000)

### 6. Zoom

**Descripción**: Acerca o aleja el canvas para ver detalles o panorama general.

**Rango**: 25% - 200%

**Métodos**:
```
Ctrl+Wheel:
├── Wheel arriba: Zoom in (+10%)
├── Wheel abajo: Zoom out (-10%)
└── Punto focal: Posición del cursor

Botones Toolbar:
├── + : Zoom in
├── - : Zoom out
└── Valor: Muestra porcentaje actual

Pinch (táctil):
├── 2 dedos juntos: Zoom out
└── 2 dedos separados: Zoom in

Comando Chat:
└── "Zoom 150" : Ajusta a 150%
```

**Comportamiento**:
- Zoom centrado en cursor (no en centro del canvas)
- Ajuste de scroll para mantener punto focal
- Transform CSS para performance
- Actualización de minimapa automática

**Niveles Comunes**:
- 25% - Vista panorámica completa
- 50% - Vista general
- 100% - Tamaño real (default)
- 150% - Zoom cómodo para edición
- 200% - Máximo detalle

### 7. Soporte Táctil

**Descripción**: Funcionalidad completa en tablets y dispositivos móviles.

#### Gestos Soportados

**1 Dedo (Panning)**:
```
Touch + Drag:
├── Mueve el canvas
├── Inercia al soltar
├── Fricción gradual
└── Cancelable con nuevo touch
```

**2 Dedos (Zoom)**:
```
Pinch:
├── Juntar dedos: Zoom out
├── Separar dedos: Zoom in
├── Escala proporcional
└── Límites 25-200%
```

**Tap**:
```
Tap en forma: Seleccionar
Tap en canvas: Deseleccionar
Doble-tap: Editar (futuro)
```

**Optimizaciones Móviles**:
- Eventos touch nativos (no mouse emulado)
- Prevención de scroll del navegador
- Velocidad calculada para inercia
- Threshold de movimiento (evita clicks accidentales)
- Botones más grandes en móvil

### 8. Conexiones entre Formas

**Descripción**: Líneas que representan relaciones entre tablas/entidades.

**Creación**:
```
Método 1 - Botón Conectar:
1. Click en "Conectar" (toolbar)
2. Click en forma origen
3. Click en forma destino
4. Conexión creada automáticamente

Método 2 - Importación SQL:
1. FK detectadas automáticamente
2. Conexiones creadas al importar
3. Validación de referencias

Método 3 - Drag & Drop:
1. Arrastra nueva forma
2. Si hay forma previa, conecta automáticamente
```

**Renderizado**:
```svg
<line 
  x1="centro de forma origen"
  y1="borde inferior de origen"
  x2="centro de forma destino"
  y2="borde superior de destino"
  marker-end="url(#arrowhead)"
/>
```

**Características**:
- Flecha en el extremo (marker SVG)
- Color: Variable CSS (--stroke-color)
- Grosor: 2px
- Actualización automática al mover formas
- Eliminación al borrar forma conectada

### 9. Tipos de Formas

**Descripción**: Catálogo completo de formas para diferentes tipos de diagramas.

#### Bases de Datos (14 formas)
```
Table          - Tabla con columnas
View           - Vista SQL
Database       - Base de datos (cilindro)
Schema         - Esquema (diamante 3D)
Procedure      - Procedimiento almacenado
Function       - Función SQL
Trigger        - Disparador
Index          - Índice
Constraint     - Restricción
Sequence       - Secuencia
Partition      - Partición
Materialized   - Vista materializada
Synonym        - Sinónimo
Package        - Paquete
Cursor         - Cursor
```

#### Diagramas ER (9 formas)
```
Entity         - Entidad (rectángulo)
Weak Entity    - Entidad débil (doble rectángulo)
Attribute      - Atributo (elipse)
Key Attribute  - Atributo clave (elipse subrayada)
Multivalued    - Atributo multivaluado (doble elipse)
Derived        - Atributo derivado (elipse punteada)
Relationship   - Relación (rombo)
Weak Relation  - Relación débil (doble rombo)
ISA            - Herencia (triángulo)
```

#### UML (10 formas)
```
Class          - Clase (3 secciones)
Interface      - Interfaz (círculo + nombre)
Abstract       - Clase abstracta (itálica)
Package        - Paquete (carpeta)
Component      - Componente (rectángulo + puertos)
Actor          - Actor (figura humana)
Use Case       - Caso de uso (elipse)
Note           - Nota (papel doblado)
State          - Estado (rectángulo redondeado)
Activity       - Actividad (rectángulo muy redondeado)
```

#### Diagramas de Flujo (40+ formas)
```
Básicas:
├── Rect, Rounded, Square, Circle
├── Diamond, Ellipse, Triangle
├── Pentagon, Hexagon, Octagon
└── Star, Cross, Plus

Flechas:
├── Arrow Up/Down/Left/Right
├── Chevron Left/Right
└── Directional indicators

Especiales:
├── Cylinder, Document, Cloud
├── Trapezoid, Parallelogram
├── Manual Input/Operation
├── Delay, Stored Data
├── Collate, Sort, Merge
└── Off-page, On-page connectors
```

**Propiedades Comunes**:
```typescript
{
  id: string           // Único
  type: string         // Tipo de forma
  x: number           // Posición X
  y: number           // Posición Y
  width: number       // Ancho
  height: number      // Alto
  fill: string        // Color de relleno
  stroke: string      // Color de borde
  text?: string       // Texto opcional
  tableData?: {       // Solo para tablas
    name: string
    columns: Column[]
  }
}
```

---

## Asistente de Diagramas

### Descripción General

El Asistente de Diagramas es una herramienta inteligente que combina dos modos de trabajo:
1. **Chat Interactivo**: Comandos en lenguaje natural
2. **Wizard Guiado**: Asistente paso a paso

### Arquitectura del Asistente

```
ChatAssistantComponent (UI)
    ↓
ChatAssistantService (Lógica)
    ↓
DiagramService (Ejecución)
    ↓
Canvas (Renderizado)
```

### Modos de Uso

#### 1. Chat Interactivo

**Descripción**: Interfaz conversacional para ejecutar comandos mediante texto.

**Características**:
- Procesamiento de lenguaje natural
- Sugerencias contextuales
- Historial de conversación
- Respuestas con acciones ejecutables

**Comandos Disponibles**:

##### Crear Tabla
```
Entrada: "Crear tabla", "Nueva tabla", "Agregar tabla"
Acción: Abre modal de creación de tabla
Resultado: Formulario para definir columnas
```

##### Importar SQL
```
Entrada: "Importar SQL", "Cargar SQL", "Pegar SQL"
Acción: Abre editor SQL
Resultado: Textarea para pegar código CREATE TABLE
```

##### Nuevo Diagrama
```
Entrada: "Nuevo diagrama", "Limpiar todo", "Empezar de nuevo"
Acción: Limpia el canvas
Resultado: Diagrama vacío
Confirmación: Pide confirmación si hay cambios sin guardar
```

##### Guardar
```
Entrada: "Guardar", "Guardar como 'Mi Diagrama'"
Acción: Guarda en galería
Extracción: Detecta nombre entre comillas o usa default
Resultado: Diagrama guardado en LocalStorage
```

##### Zoom
```
Entrada: "Zoom 150", "Acercar", "Alejar"
Acción: Ajusta nivel de zoom
Validación: Rango 25-200%
Resultado: Canvas escalado
```

##### Estadísticas
```
Entrada: "Estadísticas", "Info", "Estado"
Acción: Muestra información del diagrama
Resultado: 
  - Número de tablas
  - Número de otras formas
  - Número de conexiones
  - Nivel de zoom actual
  - Formas seleccionadas
```

##### Ayuda
```
Entrada: "Ayuda", "Help", "Qué puedes hacer"
Acción: Muestra capacidades del asistente
Resultado: Lista de funcionalidades
```

##### Ver Comandos
```
Entrada: "Comandos", "Lista de comandos"
Acción: Muestra todos los comandos disponibles
Resultado: Lista detallada con ejemplos
```

##### Plantillas
```
Entrada: "Plantillas", "Templates", "Ver plantillas"
Acción: Abre modal de plantillas
Resultado: Catálogo de plantillas predefinidas
```

##### Galería
```
Entrada: "Galería", "Mis diagramas"
Acción: Abre galería de diagramas guardados
Resultado: Lista de diagramas del usuario
```

##### Usar Wizard
```
Entrada: "Usar wizard", "Abrir wizard", "Asistente guiado"
Acción: Cambia a tab de Wizard
Resultado: Interfaz paso a paso
```

##### Crear Base de Datos (Inteligente)
```
Entrada: "Crea una base de datos de [tema]"
Ejemplos:
  - "Crea una base de datos de venta de tenis"
  - "Base de datos para una escuela"
  - "Diseña una base de datos de hospital"
  - "Base de datos de restaurante"

Proceso:
1. Extrae descripción del tema
2. Detecta dominio (ventas, educación, salud, etc.)
3. Selecciona plantilla apropiada
4. Genera tablas con columnas
5. Crea relaciones (FK)
6. Genera código SQL
7. Renderiza en canvas
8. Muestra código generado
```

### Generación Automática de Bases de Datos

**Descripción**: El asistente puede crear bases de datos completas a partir de descripciones en lenguaje natural.

#### Dominios Soportados

##### 1. Comercio/Ventas
**Palabras clave**: venta, tienda, comercio, e-commerce, productos

**Ejemplo - Tienda de Tenis**:
```
Entrada: "Crea una base de datos de venta de tenis"

Tablas generadas:
├── Clientes (id, nombre, email, telefono, direccion, fecha_registro)
├── Categorias (id, nombre, descripcion)
├── Proveedores (id, nombre, contacto, telefono, email)
├── Productos (id, nombre, marca, talla, color, precio, stock, categoria_id, proveedor_id)
├── Ventas (id, cliente_id, fecha, total, estado)
└── DetalleVentas (id, venta_id, producto_id, cantidad, precio_unitario, subtotal)

Relaciones:
├── Productos.categoria_id → Categorias.id
├── Productos.proveedor_id → Proveedores.id
├── Ventas.cliente_id → Clientes.id
├── DetalleVentas.venta_id → Ventas.id
└── DetalleVentas.producto_id → Productos.id
```

##### 2. Educación
**Palabras clave**: escuela, universidad, educación, cursos, estudiantes

**Ejemplo - Sistema Académico**:
```
Entrada: "Base de datos para una escuela"

Tablas generadas:
├── Estudiantes (id, nombre, email, fecha_nacimiento)
├── Cursos (id, nombre, creditos)
├── Profesores (id, nombre, especialidad)
└── Inscripciones (id, estudiante_id, curso_id, fecha, calificacion)

Relaciones:
├── Inscripciones.estudiante_id → Estudiantes.id
└── Inscripciones.curso_id → Cursos.id
```

##### 3. Salud
**Palabras clave**: hospital, clínica, salud, médico, paciente

**Ejemplo - Sistema Hospitalario**:
```
Entrada: "Diseña una base de datos de hospital"

Tablas generadas:
├── Pacientes (id, nombre, fecha_nacimiento, telefono, direccion)
├── Medicos (id, nombre, especialidad, telefono)
├── Citas (id, paciente_id, medico_id, fecha, motivo)
└── Tratamientos (id, cita_id, diagnostico, medicamentos)

Relaciones:
├── Citas.paciente_id → Pacientes.id
├── Citas.medico_id → Medicos.id
└── Tratamientos.cita_id → Citas.id
```

##### 4. Restaurante
**Palabras clave**: restaurante, comida, menú, pedidos

**Ejemplo - Sistema de Restaurante**:
```
Entrada: "Base de datos de restaurante"

Tablas generadas:
├── Clientes (id, nombre, telefono, direccion)
├── Categorias (id, nombre, descripcion)
├── Platos (id, nombre, precio, categoria_id, descripcion)
├── Pedidos (id, cliente_id, fecha, total, estado)
└── DetallePedidos (id, pedido_id, plato_id, cantidad, precio_unitario)

Relaciones:
├── Platos.categoria_id → Categorias.id
├── Pedidos.cliente_id → Clientes.id
├── DetallePedidos.pedido_id → Pedidos.id
└── DetallePedidos.plato_id → Platos.id
```

##### 5. Genérico
**Descripción**: Si no se detecta un dominio específico, genera estructura básica.

**Tablas generadas**:
```
├── Clientes (id, nombre, email, telefono, fecha_registro)
├── Productos (id, nombre, descripcion, precio, stock)
├── Ventas (id, cliente_id, fecha, total)
└── DetalleVentas (id, venta_id, producto_id, cantidad, precio_unitario)
```

#### Proceso de Generación

```typescript
1. extractDatabaseDescription(input)
   ↓
   Extrae tema/descripción usando regex
   Ejemplo: "venta de tenis" de "Crea una base de datos de venta de tenis"

2. inferTablesFromDescription(description)
   ↓
   Analiza palabras clave
   Detecta dominio (ventas, educación, salud, etc.)
   Selecciona plantilla apropiada

3. generateTablesForDomain(domain)
   ↓
   Retorna array de tablas con:
   - name: Nombre de la tabla
   - columns: Array de columnas
     - name: Nombre de columna
     - type: Tipo SQL
     - pk: Boolean (es primary key)
     - fk: String (tabla referenciada)

4. generateDatabaseFromDescription(description)
   ↓
   Limpia diagrama actual
   Crea formas para cada tabla
   Posiciona en grid (3 columnas)
   Calcula altura según número de columnas

5. createConnections()
   ↓
   Itera columnas buscando FK
   Busca forma de tabla referenciada
   Crea conexión si existe
   Evita duplicados

6. generateSQLFromTables(tables)
   ↓
   Genera código SQL completo:
   - CREATE TABLE para cada tabla
   - ALTER TABLE para FK
   - Comentarios con fecha

7. displayResult()
   ↓
   Muestra código SQL en modal
   Copia al portapapeles
   Notifica al usuario
```

#### Código SQL Generado

**Ejemplo completo**:
```sql
-- Base de datos generada automáticamente
-- Fecha: 14/2/2026 10:30:45

CREATE TABLE Clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100),
  email VARCHAR(100),
  telefono VARCHAR(20),
  direccion TEXT,
  fecha_registro TIMESTAMP
);

CREATE TABLE Categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50),
  descripcion TEXT
);

CREATE TABLE Productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100),
  marca VARCHAR(50),
  talla VARCHAR(10),
  color VARCHAR(30),
  precio DECIMAL(10,2),
  stock INT,
  categoria_id INT,
  proveedor_id INT
);

ALTER TABLE Productos
  ADD CONSTRAINT fk_Productos_categoria_id
  FOREIGN KEY (categoria_id)
  REFERENCES Categorias(id);

ALTER TABLE Productos
  ADD CONSTRAINT fk_Productos_proveedor_id
  FOREIGN KEY (proveedor_id)
  REFERENCES Proveedores(id);
```

### Sugerencias Contextuales

**Descripción**: El asistente ofrece sugerencias basadas en el estado del diagrama.

**Lógica**:
```typescript
getContextualSuggestions() {
  const shapes = diagramService.shapesList();
  const connections = diagramService.connectionsList();

  if (shapes.length === 0) {
    // Diagrama vacío
    return ['Crear tabla', 'Importar SQL', 'Ver plantillas'];
  }

  if (shapes.length > 0 && connections.length === 0) {
    // Hay formas pero sin conexiones
    return ['Crear conexión', 'Agregar tabla', 'Guardar'];
  }

  // Diagrama con contenido
  return ['Estadísticas', 'Guardar', 'Nuevo diagrama'];
}
```

**Ejemplos de Sugerencias**:
- Diagrama vacío: "Crear tabla", "Importar SQL", "Ver plantillas"
- Con formas: "Crear conexión", "Agregar tabla", "Guardar"
- Completo: "Estadísticas", "Guardar", "Exportar SQL"
- Después de comando: Sugerencias relacionadas

### Validaciones del Asistente

**Entrada de Usuario**:
```typescript
// Validación de mensaje
if (!text || text.length === 0) {
  return; // No enviar vacío
}

if (text.length > 1000) {
  error('Mensaje demasiado largo');
  return;
}

// Prevención XSS
const dangerousPattern = /<script|javascript:|onerror=|onclick=/i;
if (dangerousPattern.test(text)) {
  error('Contenido no permitido');
  return;
}
```

**Procesamiento de Comandos**:
```typescript
// Validación de comando
if (!input || typeof input !== 'string') {
  return invalidCommand();
}

if (input.trim().length === 0) {
  return emptyCommand();
}

if (input.length > 500) {
  return tooLongCommand();
}
```

**Generación de BD**:
```typescript
// Validación de descripción
if (!description || description.length === 0) {
  return '';
}

if (description.length > 200) {
  description = description.substring(0, 200);
}

// Límite de tablas
const limitedTables = tables.slice(0, 20);
```

#### 2. Wizard Guiado

**Descripción**: Asistente paso a paso para crear diagramas de forma estructurada.

**Acceso**: Tab "Wizard" en el modal del asistente

**Tipos de Diagramas**:

##### Base de Datos Relacional
```
Paso 1: Nombre de la base de datos
Paso 2: Definir tablas
  ├── Nombre de tabla
  ├── Agregar columnas
  │   ├── Nombre
  │   ├── Tipo de dato
  │   ├── Primary Key
  │   └── Nullable
  └── Siguiente tabla
Paso 3: Definir relaciones
  ├── Tabla origen
  ├── Tabla destino
  ├── Tipo (1:1, 1:N, N:M)
  └── Columnas FK
Paso 4: Revisión y generación
  ├── Vista previa
  ├── Código SQL
  └── Crear diagrama
```

##### Diagrama ER
```
Paso 1: Entidades
  ├── Nombre de entidad
  ├── Tipo (fuerte/débil)
  └── Atributos
Paso 2: Relaciones
  ├── Nombre de relación
  ├── Entidades participantes
  ├── Cardinalidad
  └── Atributos de relación
Paso 3: Especialización/Generalización
  ├── Entidad padre
  ├── Entidades hijas
  └── Tipo (total/parcial, disjunta/solapada)
Paso 4: Generación
```

##### Diagrama UML
```
Paso 1: Clases
  ├── Nombre de clase
  ├── Atributos (visibilidad, tipo)
  ├── Métodos (visibilidad, parámetros, retorno)
  └── Tipo (clase, interfaz, abstracta)
Paso 2: Relaciones
  ├── Asociación
  ├── Agregación
  ├── Composición
  ├── Herencia
  └── Dependencia
Paso 3: Paquetes
Paso 4: Generación
```

##### Diagrama de Flujo
```
Paso 1: Proceso principal
  ├── Inicio
  ├── Pasos del proceso
  └── Fin
Paso 2: Decisiones
  ├── Condición
  ├── Rama verdadera
  └── Rama falsa
Paso 3: Subprocesos
Paso 4: Generación
```

**Características del Wizard**:
- Navegación paso a paso
- Validación en cada paso
- Vista previa en tiempo real
- Posibilidad de volver atrás
- Guardado de progreso
- Generación automática al finalizar

### Interfaz del Asistente

**Estructura HTML**:
```html
<div class="assistant-modal-overlay">
  <div class="assistant-modal">
    <!-- Header -->
    <div class="assistant-header">
      <div class="header-content">
        <span class="icon">🧙‍♂️</span>
        <div class="header-text">
          <span class="title">Asistente de Diagramas</span>
          <span class="subtitle">Chat & Wizard</span>
        </div>
      </div>
      <button class="close-btn">×</button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab active">💬 Chat</button>
      <button class="tab">🎨 Wizard</button>
    </div>

    <!-- Chat Content -->
    <div class="chat-content">
      <div class="messages-container">
        <!-- Mensajes del chat -->
      </div>
      <div class="input-area">
        <input type="text" placeholder="Escribe tu mensaje...">
        <button class="send-btn">Enviar</button>
      </div>
    </div>

    <!-- Wizard Content -->
    <div class="wizard-content">
      <!-- Pasos del wizard -->
    </div>
  </div>
</div>
```

**Estilos Destacados**:
- Modal centrado con overlay oscuro
- Animaciones de entrada (slideUp)
- Gradiente en header (morado)
- Tabs con transiciones suaves
- Mensajes con burbujas (estilo chat)
- Sugerencias como botones
- Scroll personalizado

### Ejemplos de Uso

#### Ejemplo 1: Crear BD de E-commerce
```
Usuario: "Crea una base de datos de tienda online"

Asistente: "✅ Base de datos creada para: tienda online

📊 Se crearon 6 tablas con sus relaciones.

Tablas:
- Clientes
- Categorias
- Productos
- Ventas
- DetalleVentas
- Proveedores

📋 Código SQL generado y copiado al portapapeles."

Sugerencias: [Estadísticas] [Guardar] [Nuevo diagrama]
```

#### Ejemplo 2: Ajustar Zoom
```
Usuario: "Zoom 150"

Asistente: "Ajustando el zoom a 150%."

Sugerencias: [Zoom 100] [Zoom 200] [Estadísticas]
```

#### Ejemplo 3: Ver Estadísticas
```
Usuario: "Estadísticas"

Asistente: "📊 Estado del diagrama:

• Tablas: 6
• Conexiones: 8
• Zoom: 100%
• Seleccionadas: 0"

Sugerencias: [Crear tabla] [Importar SQL] [Guardar]
```

---

## Canvas y Controles

### Navegación

#### Mouse
- **Click izquierdo**: Seleccionar forma
- **Click derecho + arrastrar**: Panning
- **Ctrl+Click**: Multi-selección
- **Ctrl+Wheel**: Zoom
- **Shift+Wheel**: Scroll horizontal
- **Wheel**: Scroll vertical

#### Táctil
- **1 dedo**: Panning con inercia
- **2 dedos**: Pinch to zoom
- **Tap**: Seleccionar forma

#### Teclado
- **Space + arrastrar**: Panning temporal
- **G**: Toggle snap to grid
- **Ctrl+C/V/D**: Copiar/Pegar/Duplicar
- **Delete**: Eliminar selección
- **Escape**: Deseleccionar

### Formas Disponibles

#### Bases de Datos
- Table, View, Database, Schema
- Procedure, Function, Trigger
- Index, Constraint, Sequence
- Partition, Materialized View
- Synonym, Package, Cursor

#### Diagramas ER
- Entity, Weak Entity
- Attribute, Key Attribute
- Multivalued, Derived
- Relationship, Weak Relationship
- ISA (herencia)

#### UML
- Class, Interface, Abstract
- Package, Component
- Actor, Use Case
- Note, State, Activity

#### Flujo
- Rect, Rounded, Diamond, Ellipse
- Parallelogram, Hexagon, Trapezoid
- Triangle, Pentagon, Star
- Cylinder, Document, Cloud
- Arrow (up/down/left/right)
- Chevron, Cross, Plus
- Y muchas más...

---

## Validaciones

### Seguridad (XSS Prevention)
- ✅ Bloqueo de caracteres peligrosos: `<>\"'`
- ✅ Detección de scripts maliciosos
- ✅ Sanitización de entradas
- ✅ Validación de tipos de datos

### Login
- ✅ Usuario: 3-50 caracteres
- ✅ Contraseña: 4-100 caracteres
- ✅ Email: Formato válido
- ✅ Fortaleza de contraseña
- ✅ Prevención XSS

### Chat Assistant
- ✅ Mensajes: Máximo 1000 caracteres
- ✅ Comandos: Máximo 500 caracteres
- ✅ Detección de patrones peligrosos
- ✅ Validación de entrada

### Canvas
- ✅ Límite de formas: 500 por diagrama
- ✅ Copiar/Pegar: Máximo 100 formas
- ✅ Área del canvas: 0-9800 píxeles
- ✅ Validación de coordenadas
- ✅ Manejo de errores con try-catch

### Comandos
- ✅ Zoom: 25-200%
- ✅ Nombres: Máximo 100 caracteres
- ✅ Descripciones: Máximo 200 caracteres
- ✅ Tablas generadas: Máximo 20

---

## Mejoras Implementadas

### Canvas
1. **Canvas ilimitado** (10000x10000)
2. **Scrollbars siempre visibles**
3. **Panning con inercia** (estilo draw.io)
4. **Soporte táctil completo**
5. **Minimapa arrastrable**

### Importación SQL
1. **Regex mejorado** para múltiples sintaxis
2. **Detección de FK** en línea y ALTER TABLE
3. **Manejo de espacios** y saltos de línea
4. **Soporte para comentarios**

### Copiar/Pegar
1. **Multi-selección** con Ctrl+Click
2. **Copiar/Pegar** con Ctrl+C/V
3. **Duplicar** con Ctrl+D
4. **Centrado en viewport** al pegar
5. **Validaciones de límites**

### Asistente
1. **Chat + Wizard** unificados
2. **Generación automática** de BD
3. **Comandos en lenguaje natural**
4. **Sugerencias contextuales**
5. **Ejemplos predefinidos**

### Validaciones
1. **Seguridad XSS** en todos los inputs
2. **Límites de recursos** documentados
3. **Mensajes de error** claros
4. **Validación de tipos** y rangos
5. **Manejo robusto** de errores

---

## Límites y Restricciones

| Recurso | Límite | Razón |
|---------|--------|-------|
| Formas por diagrama | 500 | Performance |
| Formas en copiar/pegar | 100 | Memoria |
| Caracteres en mensaje | 1000 | UX |
| Caracteres en comando | 500 | Procesamiento |
| Tablas auto-generadas | 20 | Claridad |
| Área del canvas | 10000x10000 | Navegación |
| Zoom | 25-200% | Usabilidad |
| Usuario | 3-50 chars | Estándar |
| Contraseña | 4-100 chars | Seguridad |

---

## Solución de Problemas

### Canvas no se mueve
- Verifica que los scrollbars estén visibles
- Usa click derecho + arrastrar
- Prueba Shift+Click izquierdo

### Importación SQL falla
- Verifica sintaxis CREATE TABLE
- Asegúrate de incluir tipos de datos
- Revisa que las FK referencien tablas existentes

### Formas no se pegan
- Verifica que hayas copiado primero (Ctrl+C)
- Comprueba el límite de 500 formas
- Asegúrate de no exceder 100 formas en clipboard

### Zoom no funciona
- Usa Ctrl+Wheel (no solo Wheel)
- Verifica que el cursor esté sobre el canvas
- Rango válido: 25-200%

---

## Próximas Mejoras Sugeridas

1. **Exportación**: PDF, PNG, SVG
2. **Colaboración**: Tiempo real
3. **Versionado**: Historial de cambios
4. **Temas**: Dark mode
5. **Plantillas**: Más categorías
6. **Validación SQL**: Syntax checker
7. **Auto-layout**: Organización automática
8. **Búsqueda**: Encontrar tablas/formas

---

## Créditos

- **Estilo**: Inspirado en draw.io
- **Framework**: Angular 17
- **Iconos**: Emojis nativos
- **Diseño**: Material Design adaptado


---

## Canvas y Controles

### Descripción del Canvas

El canvas es el área principal de trabajo donde se crean y editan los diagramas. Utiliza SVG para renderizado vectorial de alta calidad.

### Estructura del Canvas

```html
<main class="canvas-wrapper">
  <!-- Contenedor con scroll -->
  <div class="canvas-container" [style.transform]="zoom">
    <!-- Grid de fondo -->
    <svg class="canvas-grid" viewBox="0 0 10000 10000">
      <!-- Puntos del grid -->
    </svg>
    
    <!-- Canvas principal -->
    <svg class="canvas-svg" viewBox="0 0 10000 10000">
      <!-- Definiciones (markers, gradientes) -->
      <defs>
        <marker id="arrowhead">
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      
      <!-- Capa de conexiones -->
      <g id="connections-layer">
        <line class="connection-line" 
              x1="..." y1="..." 
              x2="..." y2="..." 
              marker-end="url(#arrowhead)" />
      </g>
      
      <!-- Capa de formas -->
      <g id="shapes-layer">
        <g class="diagram-shape" 
           [class.selected]="isSelected"
           transform="translate(x, y)">
          <!-- Contenido de la forma -->
        </g>
      </g>
    </svg>
    
    <!-- Guías de alineación -->
    <div class="alignment-guide horizontal"></div>
    <div class="alignment-guide vertical"></div>
  </div>
  
  <!-- Minimapa -->
  <div class="minimap">
    <div class="minimap-header">🗺️ Mapa</div>
    <svg class="minimap-svg">
      <!-- Viewport y formas -->
    </svg>
  </div>
</main>
```

### Renderizado de Formas

#### Tablas
```typescript
// Estructura de tabla
<g class="diagram-shape table-shape">
  <!-- Header -->
  <rect class="table-header" width="200" height="24" />
  <text class="table-title" x="100" y="17">Usuarios</text>
  
  <!-- Filas de columnas -->
  <rect class="table-row" y="26" width="200" height="22" />
  <text class="col-text" x="8" y="42">id INT PK</text>
  
  <rect class="table-row" y="48" width="200" height="22" />
  <text class="col-text" x="8" y="64">nombre VARCHAR</text>
</g>
```

#### Formas Básicas
```typescript
// Rectángulo
<rect width="120" height="60" rx="4" fill="#f1f5f9" stroke="#6366f1" />
<text x="60" y="30" text-anchor="middle">Texto</text>

// Elipse
<ellipse cx="60" cy="30" rx="58" ry="28" fill="#f1f5f9" stroke="#6366f1" />
<text x="60" y="30" text-anchor="middle">Texto</text>

// Diamante
<polygon points="60,0 120,30 60,60 0,30" fill="#f1f5f9" stroke="#6366f1" />
<text x="60" y="30" text-anchor="middle">Texto</text>
```

### Interacciones del Usuario

#### Selección de Formas

**Click Simple**:
```typescript
onShapeMouseDown(event, shape) {
  // Si está en modo conectar
  if (connectingFromShapeId) {
    connectToShape(shape.id);
    return;
  }
  
  // Multi-selección con Ctrl
  if (event.ctrlKey) {
    toggleShapeSelection(shape.id);
    return;
  }
  
  // Selección simple
  if (!selectedShapeIds.includes(shape.id)) {
    selectShape(shape.id);
  }
  
  // Iniciar arrastre
  startDragging(event, shape);
}
```

**Multi-selección**:
```typescript
// Ctrl+Click: Agregar/quitar de selección
toggleShapeSelection(shapeId) {
  if (selectedShapeIds.includes(shapeId)) {
    // Quitar de selección
    selectedShapeIds = selectedShapeIds.filter(id => id !== shapeId);
  } else {
    // Agregar a selección
    selectedShapeIds = [...selectedShapeIds, shapeId];
  }
}

// Ctrl+A: Seleccionar todas
selectAllShapes() {
  selectedShapeIds = shapes.map(s => s.id);
}

// Escape: Deseleccionar todas
clearSelection() {
  selectedShapeIds = [];
}
```

#### Arrastre de Formas

**Proceso**:
```typescript
1. onShapeMouseDown(event, shape)
   ↓
   Guarda posición inicial de todas las formas seleccionadas
   Guarda posición del mouse
   
2. onMouseMove(event)
   ↓
   Calcula delta (diferencia de posición)
   Para cada forma seleccionada:
     ├── Calcula nueva posición
     ├── Aplica snap to grid (si está activo)
     ├── Calcula guías de alineación
     ├── Valida límites del canvas
     └── Actualiza posición
   
3. onMouseUp()
   ↓
   Limpia guías de alineación
   Finaliza arrastre
```

**Código**:
```typescript
const onMove = (e: MouseEvent) => {
  const deltaX = e.clientX - dragStart.mouseX;
  const deltaY = e.clientY - dragStart.mouseY;
  
  selectedShapes.forEach(shape => {
    const initial = initialPositions.get(shape.id);
    let newX = initial.x + deltaX;
    let newY = initial.y + deltaY;
    
    // Validar límites
    newX = Math.max(0, Math.min(9800, newX));
    newY = Math.max(0, Math.min(9800, newY));
    
    // Snap to grid
    if (snapToGrid) {
      newX = Math.round(newX / 20) * 20;
      newY = Math.round(newY / 20) * 20;
    }
    
    // Guías de alineación
    if (selectedShapes.length === 1) {
      const snapped = calculateAlignmentGuides(shape, newX, newY);
      newX = snapped.x;
      newY = snapped.y;
    }
    
    updateShape(shape.id, { x: newX, y: newY });
  });
};
```

#### Panning del Canvas

**Métodos de Activación**:
```typescript
// 1. Click derecho + drag
onContextMenu(event) {
  event.preventDefault();
  startPanning(event);
}

// 2. Shift + Click izquierdo + drag
onCanvasMouseDown(event) {
  if (event.shiftKey) {
    startPanning(event);
  }
}

// 3. Botón central del mouse
onCanvasMouseDown(event) {
  if (event.button === 1) {
    startPanning(event);
  }
}

// 4. Space + drag (temporal)
@HostListener('keydown', ['$event'])
handleKeyDown(event) {
  if (event.key === ' ' && !isPanning) {
    wrapper.style.cursor = 'grab';
  }
}
```

**Implementación con Inercia**:
```typescript
startPanning(event) {
  isPanning = true;
  panStart = {
    x: event.clientX,
    y: event.clientY,
    scrollLeft: wrapper.scrollLeft,
    scrollTop: wrapper.scrollTop
  };
  
  panVelocity = { x: 0, y: 0 };
  lastPanTime = Date.now();
  
  const onMove = (e) => {
    const deltaX = e.clientX - panStart.x;
    const deltaY = e.clientY - panStart.y;
    
    // Calcular velocidad
    const velocityX = (e.clientX - lastX) / deltaTime;
    const velocityY = (e.clientY - lastY) / deltaTime;
    panVelocity = { x: velocityX, y: velocityY };
    
    // Aplicar scroll
    wrapper.scrollLeft = panStart.scrollLeft - deltaX;
    wrapper.scrollTop = panStart.scrollTop - deltaY;
  };
  
  const onUp = () => {
    isPanning = false;
    applyPanningInertia(); // Aplicar inercia
  };
}

applyPanningInertia() {
  const friction = 0.85;
  const minVelocity = 0.5;
  
  const animate = () => {
    // Reducir velocidad
    panVelocity.x *= friction;
    panVelocity.y *= friction;
    
    // Aplicar scroll
    wrapper.scrollLeft -= panVelocity.x * 16;
    wrapper.scrollTop -= panVelocity.y * 16;
    
    // Continuar si hay velocidad
    if (Math.abs(panVelocity.x) > minVelocity || 
        Math.abs(panVelocity.y) > minVelocity) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
}
```

#### Zoom

**Implementación**:
```typescript
onWheel(event) {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault();
    
    const oldZoom = zoomLevel();
    const delta = event.deltaY > 0 ? -10 : 10;
    const newZoom = Math.max(25, Math.min(200, oldZoom + delta));
    
    if (newZoom !== oldZoom) {
      // Calcular punto focal
      const rect = wrapper.getBoundingClientRect();
      const mouseX = event.clientX - rect.left + wrapper.scrollLeft;
      const mouseY = event.clientY - rect.top + wrapper.scrollTop;
      
      // Ajustar scroll para mantener punto focal
      const zoomRatio = newZoom / oldZoom;
      const newScrollLeft = mouseX * zoomRatio - (event.clientX - rect.left);
      const newScrollTop = mouseY * zoomRatio - (event.clientY - rect.top);
      
      setZoom(newZoom);
      
      setTimeout(() => {
        wrapper.scrollLeft = newScrollLeft;
        wrapper.scrollTop = newScrollTop;
      }, 0);
    }
  }
}
```

### Minimapa

**Funcionalidades**:

#### 1. Navegación por Click
```typescript
onMinimapMouseDown(event) {
  const minimap = minimapRef.nativeElement;
  const rect = minimap.getBoundingClientRect();
  
  // Parse viewBox actual
  const [vbX, vbY, vbWidth, vbHeight] = getMinimapViewBox().split(' ').map(Number);
  
  const moveToPosition = (e) => {
    // Calcular posición relativa
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top - 30) / (rect.height - 30);
    
    // Convertir a coordenadas del canvas
    const x = vbX + (relX * vbWidth);
    const y = vbY + (relY * vbHeight);
    
    // Centrar viewport en esa posición
    wrapper.scrollLeft = x - wrapper.clientWidth / 2;
    wrapper.scrollTop = y - wrapper.clientHeight / 2;
  };
  
  moveToPosition(event);
  
  // Permitir arrastrar
  document.addEventListener('mousemove', moveToPosition);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', moveToPosition);
  });
}
```

#### 2. Arrastrar Minimapa
```typescript
onMinimapHeaderMouseDown(event) {
  event.stopPropagation();
  
  const startX = event.clientX;
  const startY = event.clientY;
  const startPosX = minimapPosition().x;
  const startPosY = minimapPosition().y;
  
  const onMove = (e) => {
    // Calcular delta (invertido porque usamos right/bottom)
    const deltaX = startX - e.clientX;
    const deltaY = startY - e.clientY;
    
    let newX = startPosX + deltaX;
    let newY = startPosY + deltaY;
    
    // Limitar a bordes del wrapper
    newX = Math.max(10, Math.min(wrapperWidth - 220, newX));
    newY = Math.max(10, Math.min(wrapperHeight - 170, newY));
    
    minimapPosition.set({ x: newX, y: newY });
  };
  
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', onMove);
  });
}
```

#### 3. ViewBox Dinámico
```typescript
getMinimapViewBox() {
  const shapes = shapesList();
  
  if (shapes.length === 0) {
    return '0 0 2000 2000'; // Default
  }
  
  // Calcular bounds de todas las formas
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  shapes.forEach(shape => {
    minX = Math.min(minX, shape.x);
    minY = Math.min(minY, shape.y);
    maxX = Math.max(maxX, shape.x + shape.width);
    maxY = Math.max(maxY, shape.y + shape.height);
  });
  
  // Agregar padding
  const padding = 200;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = maxX + padding;
  maxY = maxY + padding;
  
  const width = Math.max(maxX - minX, 2000);
  const height = Math.max(maxY - minY, 2000);
  
  return `${minX} ${minY} ${width} ${height}`;
}
```

### Guías de Alineación

**Detección**:
```typescript
calculateAlignmentGuides(movingShape, newX, newY) {
  const SNAP_THRESHOLD = 10;
  let snappedX = newX;
  let snappedY = newY;
  let horizontalGuide = null;
  let verticalGuide = null;
  
  const otherShapes = shapesList().filter(s => 
    s.id !== movingShape.id && 
    !selectedShapeIds().includes(s.id)
  );
  
  for (const shape of otherShapes) {
    // Alineación vertical (eje X)
    
    // Borde izquierdo
    if (Math.abs(newX - shape.x) < SNAP_THRESHOLD) {
      snappedX = shape.x;
      verticalGuide = shape.x;
    }
    
    // Centro horizontal
    const movingCenterX = newX + movingShape.width / 2;
    const shapeCenterX = shape.x + shape.width / 2;
    if (Math.abs(movingCenterX - shapeCenterX) < SNAP_THRESHOLD) {
      snappedX = shapeCenterX - movingShape.width / 2;
      verticalGuide = shapeCenterX;
    }
    
    // Borde derecho
    const movingRightX = newX + movingShape.width;
    const shapeRightX = shape.x + shape.width;
    if (Math.abs(movingRightX - shapeRightX) < SNAP_THRESHOLD) {
      snappedX = shapeRightX - movingShape.width;
      verticalGuide = shapeRightX;
    }
    
    // Alineación horizontal (eje Y) - similar
    // ...
  }
  
  alignmentGuides.set({ horizontal: horizontalGuide, vertical: verticalGuide });
  return { x: snappedX, y: snappedY };
}
```

**Renderizado**:
```html
<!-- Guía horizontal -->
<div class="alignment-guide horizontal" 
     [style.top.px]="alignmentGuides().horizontal"
     *ngIf="alignmentGuides().horizontal !== null">
</div>

<!-- Guía vertical -->
<div class="alignment-guide vertical" 
     [style.left.px]="alignmentGuides().vertical"
     *ngIf="alignmentGuides().vertical !== null">
</div>
```

```css
.alignment-guide {
  position: absolute;
  background: var(--accent);
  opacity: 0.6;
  pointer-events: none;
  z-index: 1000;
}

.alignment-guide.horizontal {
  left: 0;
  right: 0;
  height: 1px;
}

.alignment-guide.vertical {
  top: 0;
  bottom: 0;
  width: 1px;
}
```

### Conexiones

**Cálculo de Posiciones**:
```typescript
// Punto de inicio (centro inferior de forma origen)
getConnX1(conn) {
  const shape = shapesList().find(s => s.id === conn.fromId);
  return shape ? shape.x + shape.width / 2 : 0;
}

getConnY1(conn) {
  const shape = shapesList().find(s => s.id === conn.fromId);
  return shape ? shape.y + shape.height : 0;
}

// Punto final (centro superior de forma destino)
getConnX2(conn) {
  const shape = shapesList().find(s => s.id === conn.toId);
  return shape ? shape.x + shape.width / 2 : 0;
}

getConnY2(conn) {
  const shape = shapesList().find(s => s.id === conn.toId);
  return shape ? shape.y : 0;
}
```

**Renderizado**:
```html
<g id="connections-layer">
  @for (conn of connectionsList(); track conn.id) {
    <line class="connection-line"
          [attr.x1]="getConnX1(conn)"
          [attr.y1]="getConnY1(conn)"
          [attr.x2]="getConnX2(conn)"
          [attr.y2]="getConnY2(conn)"
          marker-end="url(#arrowhead)" />
  }
</g>
```

### Soporte Táctil

**Touch Events**:
```typescript
onTouchStart(event) {
  if (event.touches.length === 1) {
    // Un dedo = panning
    isTouchPanning = true;
    const touch = event.touches[0];
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
    
    panStart = {
      x: touch.clientX,
      y: touch.clientY,
      scrollLeft: wrapper.scrollLeft,
      scrollTop: wrapper.scrollTop
    };
    
  } else if (event.touches.length === 2) {
    // Dos dedos = zoom (pinch)
    event.preventDefault();
    isTouchPanning = false;
    
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    touchStartDistance = Math.sqrt(dx * dx + dy * dy);
    touchStartZoom = zoomLevel();
  }
}

onTouchMove(event) {
  if (event.touches.length === 1 && isTouchPanning) {
    // Panning
    const touch = event.touches[0];
    const deltaX = touch.clientX - panStart.x;
    const deltaY = touch.clientY - panStart.y;
    
    wrapper.scrollLeft = panStart.scrollLeft - deltaX;
    wrapper.scrollTop = panStart.scrollTop - deltaY;
    
  } else if (event.touches.length === 2) {
    // Zoom
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);
    
    const scale = currentDistance / touchStartDistance;
    const newZoom = Math.max(25, Math.min(200, touchStartZoom * scale));
    setZoom(newZoom);
  }
}

onTouchEnd(event) {
  if (event.touches.length === 0) {
    // Aplicar inercia
    if (isTouchPanning) {
      applyPanningInertia();
    }
    isTouchPanning = false;
    touchStartDistance = 0;
  }
}
```



---

## Validaciones

### Introducción a las Validaciones

La aplicación implementa un sistema completo de validaciones en múltiples capas para garantizar:
- **Seguridad**: Prevención de ataques XSS y inyección de código
- **Integridad**: Datos válidos y consistentes
- **Estabilidad**: Prevención de errores de runtime
- **Experiencia**: Mensajes claros y feedback inmediato

### Arquitectura de Validaciones

```
Capa de Presentación (Components)
├── Validación de formularios
├── Validación de entrada de usuario
└── Feedback visual inmediato
    ↓
Capa de Lógica (Services)
├── Validación de comandos
├── Validación de datos de negocio
└── Sanitización de entrada
    ↓
Capa de Datos (Models)
├── Validación de tipos
├── Validación de rangos
└── Validación de integridad
```

### 1. Validaciones de Seguridad (XSS Prevention)

#### Objetivo
Prevenir ataques de Cross-Site Scripting (XSS) bloqueando código malicioso en entradas de usuario.

#### Patrones Peligrosos Detectados

```typescript
// Caracteres peligrosos básicos
const dangerousChars = /[<>\"\']/;

// Patrones de scripts
const dangerousPattern = /<script|javascript:|onerror=|onclick=/i;

// Validación completa
function validateInput(input: string): boolean {
  // Bloquear caracteres peligrosos
  if (dangerousChars.test(input)) {
    return false;
  }
  
  // Bloquear patrones de script
  if (dangerousPattern.test(input)) {
    return false;
  }
  
  return true;
}
```

#### Implementación por Componente

**Login Component**:
```typescript
onLogin() {
  // Validación XSS en usuario y contraseña
  const dangerousChars = /[<>\"\']/;
  
  if (dangerousChars.test(this.loginData.username) || 
      dangerousChars.test(this.loginData.password)) {
    this.notifications.error('Los campos contienen caracteres no permitidos');
    return;
  }
  
  // Continuar con login...
}

onRegister() {
  // Validación XSS en todos los campos
  const dangerousChars = /[<>\"\']/;
  
  if (dangerousChars.test(this.registerData.username) || 
      dangerousChars.test(this.registerData.email) || 
      dangerousChars.test(this.registerData.password)) {
    this.notifications.error('Los campos contienen caracteres no permitidos');
    return;
  }
  
  // Continuar con registro...
}
```

**Chat Assistant Component**:
```typescript
sendMessage() {
  const text = this.userInput.trim();
  
  // Validación de patrones peligrosos
  const dangerousPattern = /<script|javascript:|onerror=|onclick=/i;
  
  if (dangerousPattern.test(text)) {
    this.addAssistantMessage('El mensaje contiene contenido no permitido.');
    return;
  }
  
  // Procesar mensaje...
}
```

**Chat Assistant Service**:
```typescript
private extractName(input: string): string | null {
  // Sanitización de nombre
  const sanitized = name.replace(/[<>\"\']/g, '');
  return sanitized;
}
```

#### Caracteres Bloqueados

| Carácter | Razón | Riesgo |
|----------|-------|--------|
| `<` | Inicio de tag HTML | XSS |
| `>` | Cierre de tag HTML | XSS |
| `"` | Atributo HTML | XSS |
| `'` | Atributo HTML | XSS |
| `<script` | Tag de script | XSS directo |
| `javascript:` | Protocolo JS | XSS en URLs |
| `onerror=` | Event handler | XSS en atributos |
| `onclick=` | Event handler | XSS en atributos |

### 2. Validaciones de Login

#### Validaciones en Inicio de Sesión

```typescript
onLogin() {
  // 1. Campos vacíos
  if (!this.loginData.username || !this.loginData.password) {
    this.notifications.error('Por favor completa todos los campos');
    return;
  }

  // 2. Longitud mínima de usuario
  if (this.loginData.username.trim().length < 3) {
    this.notifications.error('El usuario debe tener al menos 3 caracteres');
    return;
  }

  // 3. Longitud mínima de contraseña
  if (this.loginData.password.length < 4) {
    this.notifications.error('La contraseña debe tener al menos 4 caracteres');
    return;
  }

  // 4. Caracteres peligrosos (XSS)
  const dangerousChars = /[<>\"\']/;
  if (dangerousChars.test(this.loginData.username) || 
      dangerousChars.test(this.loginData.password)) {
    this.notifications.error('Los campos contienen caracteres no permitidos');
    return;
  }

  // 5. Trim de espacios en usuario
  const username = this.loginData.username.trim();
  
  // Proceder con autenticación
  this.authService.login(username, this.loginData.password);
}
```

**Reglas de Validación**:
- Usuario: 3-50 caracteres
- Contraseña: 4-100 caracteres
- Sin caracteres peligrosos
- Trim automático de espacios

#### Validaciones en Registro

```typescript
onRegister() {
  // 1. Campos vacíos
  if (!this.registerData.username || 
      !this.registerData.email || 
      !this.registerData.password) {
    this.notifications.error('Por favor completa todos los campos');
    return;
  }

  // 2. Longitud de usuario (mínimo)
  if (this.registerData.username.trim().length < 3) {
    this.notifications.error('El usuario debe tener al menos 3 caracteres');
    return;
  }

  // 3. Longitud de usuario (máximo)
  if (this.registerData.username.trim().length > 50) {
    this.notifications.error('El usuario no puede exceder 50 caracteres');
    return;
  }

  // 4. Formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.registerData.email.trim())) {
    this.notifications.error('Por favor ingresa un email válido');
    return;
  }

  // 5. Longitud de contraseña (mínimo)
  if (this.registerData.password.length < 6) {
    this.notifications.error('La contraseña debe tener al menos 6 caracteres');
    return;
  }

  // 6. Longitud de contraseña (máximo)
  if (this.registerData.password.length > 100) {
    this.notifications.error('La contraseña no puede exceder 100 caracteres');
    return;
  }

  // 7. Caracteres peligrosos (XSS)
  const dangerousChars = /[<>\"\']/;
  if (dangerousChars.test(this.registerData.username) || 
      dangerousChars.test(this.registerData.email) || 
      dangerousChars.test(this.registerData.password)) {
    this.notifications.error('Los campos contienen caracteres no permitidos');
    return;
  }

  // 8. Fortaleza de contraseña (advertencia)
  if (this.getPasswordStrength() === 'weak') {
    this.notifications.warning('Tu contraseña es débil. Considera usar una más fuerte.');
  }

  // 9. Normalización
  const username = this.registerData.username.trim();
  const email = this.registerData.email.trim().toLowerCase();
  
  // Proceder con registro
  this.authService.register(username, email, this.registerData.password);
}
```

**Indicador de Fortaleza de Contraseña**:
```typescript
getPasswordStrength(): 'weak' | 'medium' | 'strong' | '' {
  const password = this.registerData.password;
  if (!password) return '';
  
  // Débil: menos de 6 caracteres
  if (password.length < 6) return 'weak';
  
  // Media: 6-9 caracteres
  if (password.length < 10) return 'medium';
  
  // Verificar complejidad
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  const complexity = [hasUpper, hasLower, hasNumber, hasSpecial]
    .filter(Boolean).length;
  
  // Fuerte: 10+ caracteres con 3+ tipos
  if (complexity >= 3) return 'strong';
  
  // Media: 10+ caracteres con 2 tipos
  if (complexity >= 2) return 'medium';
  
  return 'weak';
}

getPasswordStrengthText(): string {
  const strength = this.getPasswordStrength();
  switch (strength) {
    case 'weak': return 'Contraseña débil';
    case 'medium': return 'Contraseña media';
    case 'strong': return 'Contraseña fuerte';
    default: return '';
  }
}
```

**Visualización**:
```html
<div class="password-strength">
  <div class="strength-bar" 
       [class.weak]="getPasswordStrength() === 'weak'"
       [class.medium]="getPasswordStrength() === 'medium'"
       [class.strong]="getPasswordStrength() === 'strong'">
  </div>
  <small class="strength-text">{{ getPasswordStrengthText() }}</small>
</div>
```

### 3. Validaciones del Chat Assistant

#### Validación de Mensajes

```typescript
sendMessage() {
  const text = this.userInput.trim();
  
  // 1. Mensaje vacío
  if (!text) {
    return; // No hacer nada
  }

  // 2. Longitud máxima
  if (text.length > 1000) {
    this.addAssistantMessage(
      'El mensaje es demasiado largo. Por favor, usa menos de 1000 caracteres.'
    );
    return;
  }

  // 3. Patrones peligrosos (XSS)
  const dangerousPattern = /<script|javascript:|onerror=|onclick=/i;
  if (dangerousPattern.test(text)) {
    this.addAssistantMessage('El mensaje contiene contenido no permitido.');
    return;
  }

  // Procesar mensaje
  this.addUserMessage(text);
  this.userInput = '';
  setTimeout(() => this.processCommand(text), 300);
}
```

**Reglas**:
- Mínimo: 1 carácter (después de trim)
- Máximo: 1000 caracteres
- Sin patrones peligrosos
- Trim automático

#### Validación de Comandos

```typescript
processCommand(input: string): CommandResponse {
  // 1. Validación de entrada
  if (!input || typeof input !== 'string') {
    return {
      message: 'Comando inválido.',
      suggestions: ['Ayuda', 'Ver comandos']
    };
  }

  const trimmed = input.trim();
  
  // 2. Longitud mínima
  if (trimmed.length === 0) {
    return {
      message: 'Por favor escribe un comando.',
      suggestions: ['Ayuda', 'Ver comandos', 'Crear tabla']
    };
  }

  // 3. Longitud máxima
  if (trimmed.length > 500) {
    return {
      message: 'El comando es demasiado largo. Por favor usa menos de 500 caracteres.',
      suggestions: ['Ayuda', 'Ver comandos']
    };
  }

  // Procesar comando
  const lower = trimmed.toLowerCase();
  // ...
}
```

**Reglas**:
- Tipo: string
- Mínimo: 1 carácter
- Máximo: 500 caracteres
- Trim automático

#### Validación de Zoom

```typescript
private handleZoom(input: string): CommandResponse {
  const zoomMatch = input.match(/\d+/);
  
  if (zoomMatch) {
    const zoomValue = parseInt(zoomMatch[0]);
    
    // 1. Número válido
    if (isNaN(zoomValue) || !isFinite(zoomValue)) {
      return {
        message: 'Valor de zoom inválido. Usa un número entre 25 y 200.',
        suggestions: ['Zoom 100', 'Zoom 150', 'Zoom 200']
      };
    }

    // 2. Rango válido
    if (zoomValue < 25 || zoomValue > 200) {
      return {
        message: 'El zoom debe estar entre 25% y 200%.',
        suggestions: ['Zoom 25', 'Zoom 100', 'Zoom 200']
      };
    }

    // 3. Aplicar límites
    const finalZoom = Math.max(25, Math.min(200, zoomValue));
    
    return {
      message: `Ajustando el zoom a ${finalZoom}%.`,
      suggestions: ['Zoom 100', 'Zoom 150', 'Estadísticas'],
      action: () => this.diagramService.setZoom(finalZoom)
    };
  }
  
  return {
    message: 'Por favor especifica un valor de zoom entre 25 y 200. Ejemplo: "Zoom 150"',
    suggestions: ['Zoom 100', 'Zoom 150', 'Zoom 200']
  };
}
```

**Reglas**:
- Tipo: número entero
- Rango: 25-200
- Validación NaN/Infinity
- Math.max/min para garantizar rango

#### Validación de Nombres

```typescript
private extractName(input: string): string | null {
  // 1. Validar entrada
  if (!input || typeof input !== 'string') {
    return null;
  }

  const patterns = [
    /guardar\s+(?:como\s+)?["']([^"']+)["']/i,
    /guardar\s+(?:como\s+)?(\w+)/i
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      
      // 2. Longitud mínima
      if (name.length === 0) {
        return null;
      }
      
      // 3. Longitud máxima
      if (name.length > 100) {
        return name.substring(0, 100);
      }

      // 4. Sanitización
      const sanitized = name.replace(/[<>\"\']/g, '');
      
      return sanitized;
    }
  }

  return null;
}
```

**Reglas**:
- Tipo: string
- Mínimo: 1 carácter
- Máximo: 100 caracteres
- Sanitización de caracteres peligrosos

#### Validación de Generación de BD

```typescript
private generateDatabaseFromDescription(description: string) {
  // 1. Validar descripción
  if (!description || typeof description !== 'string') {
    return '';
  }

  const trimmed = description.trim();
  
  // 2. Longitud mínima
  if (trimmed.length === 0) {
    return '';
  }

  // 3. Longitud máxima
  if (trimmed.length > 200) {
    description = trimmed.substring(0, 200);
  }

  // 4. Generar tablas
  const tables = this.inferTablesFromDescription(description);
  
  // 5. Validar que se generaron tablas
  if (!tables || tables.length === 0) {
    return '';
  }

  // 6. Limitar número de tablas
  const limitedTables = tables.slice(0, 20);
  
  // 7. Validar datos de cada tabla
  limitedTables.forEach((table, index) => {
    if (!table || !table.name || !table.columns) {
      return; // Skip tabla inválida
    }
    
    // Crear forma...
  });
  
  // Continuar con generación...
}
```

**Reglas**:
- Tipo: string
- Mínimo: 1 carácter
- Máximo: 200 caracteres
- Máximo 20 tablas generadas
- Validación de estructura de tabla

### 4. Validaciones del Canvas

#### Validación de Drop

```typescript
onDrop(event: DragEvent): void {
  event.preventDefault();
  
  const data = event.dataTransfer?.getData('application/shape');
  
  // 1. Datos existen
  if (!data) {
    this.notifications.error('No se pudo obtener los datos de la forma');
    return;
  }

  try {
    const { shape, table } = JSON.parse(data);
    
    // 2. Tipo de forma válido
    if (!shape || typeof shape !== 'string') {
      this.notifications.error('Tipo de forma inválido');
      return;
    }

    // 3. Calcular posición
    const wrapper = this.wrapperRef.nativeElement;
    const rect = wrapper.getBoundingClientRect();
    const zoom = this.diagram.zoomLevel() / 100;
    const dropX = (event.clientX - rect.left + wrapper.scrollLeft) / zoom;
    const dropY = (event.clientY - rect.top + wrapper.scrollTop) / zoom;
    
    // 4. Validar coordenadas
    if (isNaN(dropX) || isNaN(dropY) || !isFinite(dropX) || !isFinite(dropY)) {
      this.notifications.error('Posición inválida para la forma');
      return;
    }

    const x = dropX - w / 2;
    const y = dropY - h / 2;

    // 5. Validar límites del canvas
    if (x < 0 || y < 0 || x > 9800 || y > 9800) {
      this.notifications.warning('La forma está fuera del área del canvas');
    }

    // Crear forma...
    
  } catch (error) {
    console.error('Error al procesar drop:', error);
    this.notifications.error('Error al agregar la forma');
  }
}
```

**Reglas**:
- Datos no nulos
- Tipo de forma válido (string)
- Coordenadas válidas (números finitos)
- Dentro de límites (0-9800)
- Try-catch para errores de parsing

#### Validación de Movimiento

```typescript
onShapeMouseDown(event: MouseEvent, shape: DiagramShape): void {
  event.stopPropagation();
  
  // 1. Validar que la forma existe
  if (!shape || !shape.id) {
    this.notifications.error('Forma inválida');
    return;
  }
  
  // ... (lógica de selección)
  
  // 2. Validar formas seleccionadas
  const selectedShapes = this.diagram.shapesList().filter(s => 
    this.diagram.selectedShapeIds().includes(s.id)
  );
  
  if (selectedShapes.length === 0) {
    return;
  }
  
  const onMove = (e: MouseEvent) => {
    selectedShapes.forEach(s => {
      const initial = initialPositions.get(s.id);
      
      // 3. Validar posición inicial existe
      if (!initial) return;
      
      let newX = initial.x + deltaX;
      let newY = initial.y + deltaY;
      
      // 4. Validar límites del canvas
      newX = Math.max(0, Math.min(9800, newX));
      newY = Math.max(0, Math.min(9800, newY));
      
      // Actualizar...
    });
  };
}
```

**Reglas**:
- Forma no nula
- ID de forma existe
- Posiciones iniciales válidas
- Límites del canvas (0-9800)
- Math.max/min para garantizar rango

#### Validación de Copiar

```typescript
private copySelectedShapes(): void {
  const selectedIds = this.diagram.selectedShapeIds();
  
  // 1. Validar que hay formas seleccionadas
  if (selectedIds.length === 0) {
    this.notifications.warning('No hay formas seleccionadas para copiar');
    return;
  }

  // 2. Validar límite de formas
  if (selectedIds.length > 100) {
    this.notifications.error('No se pueden copiar más de 100 formas a la vez');
    return;
  }

  const shapes = this.diagram.shapesList().filter(s => 
    selectedIds.includes(s.id)
  );
  
  // 3. Deep clone
  this.clipboard = shapes.map(shape => ({
    ...shape,
    id: shape.id,
    tableData: shape.tableData ? {
      name: shape.tableData.name,
      columns: shape.tableData.columns.map(col => ({ ...col }))
    } : undefined
  }));
  
  this.notifications.success(`${this.clipboard.length} forma(s) copiada(s)`);
}
```

**Reglas**:
- Mínimo: 1 forma seleccionada
- Máximo: 100 formas
- Deep clone para evitar referencias
- Notificación de confirmación

#### Validación de Pegar

```typescript
private pasteShapes(): void {
  // 1. Validar clipboard no vacío
  if (this.clipboard.length === 0) {
    this.notifications.warning('No hay formas en el portapapeles');
    return;
  }

  // 2. Validar límite de formas a pegar
  if (this.clipboard.length > 100) {
    this.notifications.error('No se pueden pegar más de 100 formas a la vez');
    return;
  }

  // 3. Validar límite total de formas
  const currentShapesCount = this.diagram.shapesList().length;
  if (currentShapesCount + this.clipboard.length > 500) {
    this.notifications.error('El diagrama no puede tener más de 500 formas');
    return;
  }
  
  this.clipboard.forEach(shape => {
    let newX = viewportCenterX + offsetX - 60;
    let newY = viewportCenterY + offsetY - 40;

    // 4. Validar límites del canvas
    newX = Math.max(0, Math.min(9800, newX));
    newY = Math.max(0, Math.min(9800, newY));
    
    // Crear forma...
  });
  
  this.notifications.success(`${newShapeIds.length} forma(s) pegada(s)`);
}
```

**Reglas**:
- Clipboard no vacío
- Máximo 100 formas por operación
- Máximo 500 formas totales
- Límites del canvas (0-9800)
- IDs únicos generados

### 5. Tabla de Límites y Restricciones

| Recurso | Límite Mínimo | Límite Máximo | Componente | Razón |
|---------|---------------|---------------|------------|-------|
| Usuario | 3 chars | 50 chars | Login | Estándar |
| Contraseña | 4 chars | 100 chars | Login | Seguridad |
| Email | - | - | Login | Formato válido |
| Mensaje chat | 1 char | 1000 chars | Chat Assistant | UX |
| Comando | 1 char | 500 chars | Chat Service | Procesamiento |
| Nombre diagrama | 1 char | 100 chars | Chat Service | Display |
| Descripción BD | 1 char | 200 chars | Chat Service | Generación |
| Zoom | 25% | 200% | Canvas/Service | Usabilidad |
| Formas copiar/pegar | 1 | 100 | Canvas | Memoria |
| Formas totales | 0 | 500 | Canvas | Performance |
| Tablas generadas | 0 | 20 | Chat Service | Claridad |
| Área canvas | 0px | 9800px | Canvas | Navegación |
| Coordenadas | -Infinity | +Infinity | Canvas | Validación NaN |

### 6. Patrones de Validación

#### Patrón 1: Validación Básica
```typescript
if (!input || typeof input !== 'string') {
  return error('Entrada inválida');
}
```

#### Patrón 2: Validación de Rango
```typescript
if (value < min || value > max) {
  return error(`Valor debe estar entre ${min} y ${max}`);
}
const safeValue = Math.max(min, Math.min(max, value));
```

#### Patrón 3: Validación de Longitud
```typescript
if (text.length < minLength) {
  return error(`Mínimo ${minLength} caracteres`);
}
if (text.length > maxLength) {
  return error(`Máximo ${maxLength} caracteres`);
}
```

#### Patrón 4: Sanitización
```typescript
const sanitized = input.replace(/[<>\"\']/g, '');
```

#### Patrón 5: Validación de Números
```typescript
if (isNaN(value) || !isFinite(value)) {
  return error('Número inválido');
}
```

#### Patrón 6: Try-Catch
```typescript
try {
  const data = JSON.parse(input);
  // procesar...
} catch (error) {
  console.error('Error:', error);
  notifications.error('Datos inválidos');
}
```

### 7. Mensajes de Error

#### Principios
- **Claros**: Explican qué está mal
- **Específicos**: Indican el campo o valor problemático
- **Accionables**: Sugieren cómo corregir
- **Amigables**: Tono positivo y constructivo

#### Ejemplos

**Malos**:
- ❌ "Error"
- ❌ "Valor inválido"
- ❌ "No se puede"

**Buenos**:
- ✅ "El usuario debe tener al menos 3 caracteres"
- ✅ "Por favor ingresa un email válido"
- ✅ "El zoom debe estar entre 25% y 200%"
- ✅ "No se pueden copiar más de 100 formas a la vez"

### 8. Validaciones Futuras Sugeridas

1. **SQL Injection Prevention**: Validar código SQL importado
2. **Rate Limiting**: Limitar operaciones costosas por tiempo
3. **File Size Validation**: Validar tamaño en importación
4. **Data Format Validation**: Validar formato en exportación
5. **Permission Validation**: Validar permisos por rol
6. **Audit Logging**: Registrar operaciones críticas
7. **Connection Integrity**: Validar integridad de conexiones
8. **Name Uniqueness**: Validar unicidad de nombres de tablas
9. **Circular Reference Detection**: Detectar referencias circulares en FK
10. **Schema Validation**: Validar esquema completo antes de guardar

