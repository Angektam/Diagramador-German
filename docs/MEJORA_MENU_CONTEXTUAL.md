# 🎯 Mejora: Menú Contextual (Right-Click)

## 📋 Descripción

Sistema de menú contextual que aparece al hacer click derecho sobre formas o el canvas, proporcionando acceso rápido a acciones comunes sin necesidad de usar la barra de herramientas o atajos de teclado.

---

## ✨ Características Implementadas

### 1. Menú para Formas
Al hacer click derecho sobre una forma, se muestra un menú con las siguientes opciones:

- ✏️ **Editar** - Editar propiedades de la forma (Enter)
- 📋 **Duplicar** - Crear una copia de la forma (Ctrl+D)
- 📄 **Copiar** - Copiar al portapapeles (Ctrl+C)
- ✂️ **Cortar** - Cortar al portapapeles (Ctrl+X)
- 📋 **Pegar** - Pegar desde portapapeles (Ctrl+V)
- ⬆️ **Traer al frente** - Mover la forma al frente
- ⬇️ **Enviar atrás** - Mover la forma atrás
- 🎨 **Cambiar color** - Modificar el color de la forma
- 📏 **Alinear** - Alinear con otras formas seleccionadas
- 🗑️ **Eliminar** - Eliminar la forma (Del)

### 2. Menú para Canvas
Al hacer click derecho en el canvas vacío:

- 📋 **Pegar** - Pegar formas copiadas (Ctrl+V)
- 🔍 **Zoom In** - Acercar (Ctrl++)
- 🔍 **Zoom Out** - Alejar (Ctrl+-)
- 🔍 **Ajustar al 100%** - Restablecer zoom (Ctrl+0)
- ✅ **Seleccionar todo** - Seleccionar todas las formas (Ctrl+A)
- 🧹 **Limpiar canvas** - Eliminar todas las formas

### 3. Características del Menú

- **Posicionamiento inteligente**: El menú se ajusta automáticamente si se sale de la pantalla
- **Cierre automático**: Se cierra al hacer click fuera o al seleccionar una opción
- **Atajos visibles**: Muestra los atajos de teclado correspondientes
- **Estados deshabilitados**: Opciones no disponibles aparecen deshabilitadas
- **Animación suave**: Aparece con una animación de fade-in
- **Adaptado a temas**: Funciona con modo claro y oscuro

---

## 🏗️ Arquitectura

### Componentes Creados

#### 1. `ContextMenuComponent`
```typescript
src/app/components/context-menu/context-menu.component.ts
```

Componente standalone que renderiza el menú contextual:
- Gestiona la visibilidad y posición del menú
- Renderiza items con iconos, etiquetas y atajos
- Maneja el cierre automático
- Ajusta posición si se sale de la pantalla

#### 2. `ContextMenuService`
```typescript
src/app/services/context-menu.service.ts
```

Servicio que gestiona la lógica del menú:
- Define los items para cada tipo de menú
- Controla la visibilidad del menú
- Maneja callbacks de acciones
- Proporciona métodos para mostrar diferentes menús

### Integración

El menú está integrado en `CanvasComponent`:
- Registra el componente en `ngAfterViewInit`
- Intercepta eventos `contextmenu`
- Determina si el click fue en una forma o en el canvas
- Ejecuta las acciones correspondientes

---

## 🎨 Estilos

### Variables CSS Utilizadas
```css
--bg-primary      /* Fondo del menú */
--bg-secondary    /* Hover de items */
--text-primary    /* Texto principal */
--text-secondary  /* Atajos de teclado */
--border          /* Bordes y divisores */
```

### Animaciones
- **fadeIn**: Aparición suave del menú (0.15s)
- **hover**: Transición de fondo en items (0.15s)

---

## 🔧 Uso

### Para Usuarios

1. **Menú en Forma**:
   - Haz click derecho sobre cualquier forma
   - Selecciona la acción deseada
   - El menú se cierra automáticamente

2. **Menú en Canvas**:
   - Haz click derecho en un área vacía del canvas
   - Selecciona la acción deseada

3. **Cerrar Menú**:
   - Click fuera del menú
   - Presiona Escape
   - Selecciona una opción

### Para Desarrolladores

#### Agregar Nuevas Acciones

1. **Agregar item al menú**:
```typescript
// En context-menu.service.ts
const items: ContextMenuItem[] = [
  { 
    icon: '🎨', 
    label: 'Nueva Acción', 
    action: 'newAction',
    shortcut: 'Ctrl+N'
  }
];
```

2. **Implementar handler**:
```typescript
// En canvas.component.ts
private handleShapeAction(action: string, shapeId: string): void {
  switch (action) {
    case 'newAction':
      // Implementar lógica
      break;
  }
}
```

#### Crear Nuevo Tipo de Menú

```typescript
// En context-menu.service.ts
showCustomMenu(x: number, y: number, onAction: (action: string) => void) {
  const items: ContextMenuItem[] = [
    // Definir items personalizados
  ];
  
  const menu = this.menuRef();
  if (menu) {
    menu.show(x, y, items, onAction);
  }
}
```

---

## 📊 Acciones Implementadas

### Acciones Funcionales ✅

| Acción | Descripción | Estado |
|--------|-------------|--------|
| Duplicar | Crea copia de la forma | ✅ Funcional |
| Copiar | Copia al portapapeles | ✅ Funcional |
| Cortar | Corta al portapapeles | ✅ Funcional |
| Pegar | Pega desde portapapeles | ✅ Funcional |
| Eliminar | Elimina la forma | ✅ Funcional |
| Traer al frente | Cambia z-index | ✅ Funcional |
| Enviar atrás | Cambia z-index | ✅ Funcional |
| Zoom In/Out | Controla zoom | ✅ Funcional |
| Seleccionar todo | Selecciona todas las formas | ✅ Funcional |
| Limpiar canvas | Elimina todo | ✅ Funcional |

### Acciones Pendientes 🔄

| Acción | Descripción | Estado |
|--------|-------------|--------|
| Editar | Abrir modal de edición | 🔄 Pendiente |
| Cambiar color | Selector de color | 🔄 Pendiente |
| Alinear | Alineación múltiple | 🔄 Pendiente |

---

## 🎯 Beneficios

### Para Usuarios
- ✅ Acceso rápido a acciones comunes
- ✅ Menos clicks necesarios
- ✅ Flujo de trabajo más natural
- ✅ Descubrimiento de funcionalidades
- ✅ Atajos de teclado visibles

### Para el Sistema
- ✅ Mejor UX/UI
- ✅ Reducción de carga cognitiva
- ✅ Consistencia con aplicaciones estándar
- ✅ Accesibilidad mejorada

---

## 🧪 Pruebas

### Casos de Prueba

1. **Menú en Forma**:
   - ✅ Click derecho muestra menú
   - ✅ Posición correcta
   - ✅ Todas las opciones visibles
   - ✅ Atajos mostrados

2. **Menú en Canvas**:
   - ✅ Click derecho en vacío muestra menú
   - ✅ Opciones correctas
   - ✅ Funcionalidad de zoom

3. **Acciones**:
   - ✅ Duplicar crea copia
   - ✅ Copiar/Pegar funciona
   - ✅ Eliminar remueve forma
   - ✅ Z-index se modifica

4. **Comportamiento**:
   - ✅ Cierre automático
   - ✅ Ajuste de posición
   - ✅ Temas claro/oscuro

---

## 🚀 Mejoras Futuras

### Corto Plazo
- [ ] Implementar edición inline
- [ ] Selector de color funcional
- [ ] Alineación múltiple
- [ ] Menú para conexiones

### Mediano Plazo
- [ ] Submenús anidados
- [ ] Acciones personalizables
- [ ] Historial de acciones recientes
- [ ] Búsqueda en menú

### Largo Plazo
- [ ] Menús contextuales personalizables por usuario
- [ ] Macros y acciones compuestas
- [ ] Integración con plugins

---

## 📝 Notas Técnicas

### Gestión de Estado
- El menú no mantiene estado propio
- Toda la lógica está en el servicio
- Las acciones se ejecutan en el componente padre

### Rendimiento
- Menú se renderiza solo cuando es visible
- Cierre automático libera recursos
- Sin memory leaks

### Accesibilidad
- Navegación por teclado (futuro)
- Roles ARIA apropiados
- Contraste adecuado

---

## 🔗 Archivos Relacionados

### Nuevos Archivos
- `src/app/components/context-menu/context-menu.component.ts`
- `src/app/services/context-menu.service.ts`
- `docs/MEJORA_MENU_CONTEXTUAL.md`

### Archivos Modificados
- `src/app/components/canvas/canvas.component.ts`

---

## 📚 Referencias

- [Material Design - Menus](https://material.io/components/menus)
- [Context Menu Best Practices](https://www.nngroup.com/articles/context-menus/)
- [Angular Signals](https://angular.io/guide/signals)

---

**Fecha de Implementación**: Febrero 2026  
**Versión**: 1.1.0  
**Estado**: ✅ Implementado y Funcional  
**Prioridad Original**: Alta 🔴
