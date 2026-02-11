# 🧙‍♂️ Asistente de Diagramas - Guía de Usuario

## Descripción

El Asistente de Diagramas es un chatbot integrado que te ayuda a crear y gestionar diagramas de bases de datos mediante comandos de texto natural.

## Características

### ✨ Interfaz Intuitiva
- Chat flotante en la esquina inferior derecha
- Minimizable para no interferir con tu trabajo
- Sugerencias rápidas contextuales
- Historial de conversación

### 🎯 Comandos Disponibles

#### Crear Tablas
```
"Crear tabla"
"Nueva tabla"
"Agregar tabla"
```
Abre el modal para crear una nueva tabla con columnas personalizadas.

#### Importar SQL
```
"Importar SQL"
"Cargar SQL"
"Pegar SQL"
```
Abre el editor SQL para importar código CREATE TABLE.

#### Gestión de Diagramas
```
"Nuevo diagrama"
"Limpiar todo"
"Empezar de nuevo"
```
Crea un diagrama vacío.

```
"Guardar"
"Guardar como Mi Proyecto"
"Guardar 'Diagrama de Usuarios'"
```
Guarda el diagrama actual en la galería.

#### Control de Vista
```
"Zoom 150"
"Zoom 100"
"Acercar"
```
Ajusta el nivel de zoom (25-200%).

#### Información
```
"Estadísticas"
"Info"
"Estado"
```
Muestra información sobre el diagrama actual:
- Número de tablas
- Número de conexiones
- Nivel de zoom
- Elementos seleccionados

#### Plantillas
```
"Plantillas"
"Ver plantillas"
"Templates"
```
Abre el catálogo de plantillas predefinidas.

#### Ayuda
```
"Ayuda"
"Qué puedes hacer"
"Comandos"
```
Muestra la lista de comandos disponibles.

## Sugerencias Contextuales

El asistente proporciona sugerencias inteligentes basadas en el estado actual:

- **Diagrama vacío**: Sugiere crear tabla, importar SQL o usar plantillas
- **Con tablas pero sin conexiones**: Sugiere crear conexiones o agregar más tablas
- **Diagrama completo**: Sugiere guardar, ver estadísticas o crear nuevo

## Ejemplos de Uso

### Ejemplo 1: Crear un diagrama desde cero
```
Usuario: "Hola"
Asistente: "¡Hola! 🧙‍♂️ Soy tu asistente..."
         [Crear tabla] [Importar SQL] [Ver plantillas]

Usuario: "Crear tabla"
Asistente: "Abriendo el modal para crear una nueva tabla..."
         [Importar SQL] [Ver plantillas] [Estadísticas]
```

### Ejemplo 2: Importar SQL
```
Usuario: "Importar SQL"
Asistente: "Abriendo el editor SQL. Pega tu código CREATE TABLE..."
         [Crear tabla] [Ver comandos] [Ayuda]
```

### Ejemplo 3: Guardar con nombre
```
Usuario: "Guardar como Sistema de Usuarios"
Asistente: "Guardando tu diagrama como 'Sistema de Usuarios'..."
         [Crear tabla] [Nuevo diagrama] [Estadísticas]
```

### Ejemplo 4: Ajustar zoom
```
Usuario: "Zoom 150"
Asistente: "Ajustando el zoom a 150%."
         [Zoom 100] [Zoom 150] [Estadísticas]
```

## Características Técnicas

### Arquitectura
- **Componente**: `ChatAssistantComponent`
- **Servicio**: `ChatAssistantService`
- **Integración**: Conectado con `DiagramService`

### Procesamiento de Comandos
1. El usuario escribe un mensaje
2. El servicio analiza el texto
3. Identifica el comando mediante patrones
4. Ejecuta la acción correspondiente
5. Proporciona feedback y sugerencias

### Sugerencias Inteligentes
El asistente analiza:
- Número de formas en el canvas
- Número de conexiones
- Estado de selección
- Historial de acciones

## Personalización

### Agregar Nuevos Comandos

Edita `src/app/services/chat-assistant.service.ts`:

```typescript
private commands = {
  // ... comandos existentes
  miComando: ['palabra clave 1', 'palabra clave 2'],
};
```

Luego implementa el handler:

```typescript
case 'miComando':
  return {
    message: 'Mensaje de respuesta',
    suggestions: ['Sugerencia 1', 'Sugerencia 2'],
    action: () => this.ejecutarAccion()
  };
```

### Modificar Estilos

Los estilos están en el componente. Puedes personalizar:
- Colores del gradiente del header
- Tamaño del chat
- Posición en pantalla
- Animaciones

## Mejores Prácticas

1. **Usa comandos cortos**: "Crear tabla" en lugar de frases largas
2. **Aprovecha las sugerencias**: Haz clic en los botones de sugerencia
3. **Minimiza cuando no uses**: Mantén tu espacio de trabajo limpio
4. **Pide ayuda**: Escribe "ayuda" si no recuerdas un comando

## Próximas Mejoras

- [ ] Comandos de voz
- [ ] Historial persistente
- [ ] Exportar conversación
- [ ] Comandos personalizados por usuario
- [ ] Integración con IA para comandos más naturales
- [ ] Atajos de teclado
- [ ] Modo oscuro

## Soporte

Si encuentras algún problema o tienes sugerencias, el asistente siempre está disponible para ayudarte. Simplemente escribe "ayuda" para comenzar.
