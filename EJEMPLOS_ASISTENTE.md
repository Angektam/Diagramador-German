# 🎯 Ejemplos Avanzados del Asistente de Diagramas

## Flujos de Trabajo Comunes

### 1. Crear un Diagrama Completo desde Cero

```
Usuario: "Hola"
Asistente: "¡Hola! 🧙‍♂️ Soy tu asistente de diagramas..."

Usuario: "Crear tabla"
[Se abre el modal, usuario crea tabla "usuarios"]

Usuario: "Crear tabla"
[Se abre el modal, usuario crea tabla "pedidos"]

Usuario: "Estadísticas"
Asistente: "📊 Estado del diagrama:
• Tablas: 2
• Conexiones: 0
• Zoom: 100%"

Usuario: "Guardar como Sistema de Pedidos"
Asistente: "Guardando tu diagrama como 'Sistema de Pedidos'..."
```

### 2. Importar y Ajustar SQL

```
Usuario: "Importar SQL"
[Se abre el editor SQL, usuario pega código]

Usuario: "Estadísticas"
Asistente: "📊 Estado del diagrama:
• Tablas: 5
• Conexiones: 4
• Zoom: 100%"

Usuario: "Zoom 150"
Asistente: "Ajustando el zoom a 150%."

Usuario: "Guardar"
Asistente: "Guardando tu diagrama como 'Mi Diagrama'..."
```

### 3. Explorar y Aprender

```
Usuario: "Ayuda"
Asistente: "🧙‍♂️ Puedo ayudarte con:
🎨 Crear y editar tablas de bases de datos
📥 Importar código SQL (CREATE TABLE)
💾 Guardar y cargar diagramas
..."

Usuario: "Ver comandos"
Asistente: "📋 Comandos disponibles:
• 'Crear tabla' - Abre el modal...
• 'Importar SQL' - Abre el editor SQL...
..."

Usuario: "Plantillas"
[Se abre el modal de plantillas]
```

## Comandos Encadenados

### Workflow: Nuevo Proyecto
```
1. "Nuevo diagrama"
2. "Ver plantillas"
3. [Seleccionar plantilla]
4. "Zoom 125"
5. "Guardar como Mi Proyecto"
```

### Workflow: Importación Rápida
```
1. "Importar SQL"
2. [Pegar código]
3. "Estadísticas"
4. "Guardar"
```

### Workflow: Revisión y Ajuste
```
1. "Estadísticas"
2. "Zoom 150"
3. "Crear tabla"
4. "Guardar"
```

## Comandos por Categoría

### 📊 Información
```
"Estadísticas"
"Info"
"Estado"
"Información"
```

### 🎨 Creación
```
"Crear tabla"
"Nueva tabla"
"Agregar tabla"
"Add table"
```

### 📥 Importación
```
"Importar SQL"
"Cargar SQL"
"Import SQL"
"Pegar SQL"
```

### 💾 Guardado
```
"Guardar"
"Guardar como Proyecto X"
"Guardar 'Mi Diagrama'"
"Save"
```

### 🔍 Vista
```
"Zoom 100"
"Zoom 150"
"Zoom 200"
"Acercar"
"Alejar"
```

### 🔄 Gestión
```
"Nuevo diagrama"
"Limpiar todo"
"Borrar todo"
"Empezar de nuevo"
```

### 🎯 Plantillas
```
"Plantillas"
"Templates"
"Ver plantillas"
```

### ❓ Ayuda
```
"Ayuda"
"Help"
"Qué puedes hacer"
"Comandos"
"Lista de comandos"
"Ver comandos"
```

## Tips y Trucos

### 1. Usa las Sugerencias
Las sugerencias cambian según el contexto. Aprovéchalas para descubrir nuevas funciones.

### 2. Nombres con Espacios
Para guardar con nombres que tienen espacios:
```
"Guardar como Sistema de Usuarios"
"Guardar 'Mi Proyecto 2024'"
```

### 3. Comandos Cortos
No necesitas frases completas:
```
✅ "Crear tabla"
✅ "Zoom 150"
✅ "Guardar"

❌ "Por favor, ¿podrías crear una tabla nueva?"
```

### 4. Estadísticas Rápidas
Usa "info" o "estado" como atajos para "estadísticas".

### 5. Minimiza el Chat
Haz clic en el header para minimizar y maximizar rápidamente.

## Casos de Uso Reales

### Caso 1: Estudiante de Base de Datos
```
Objetivo: Crear diagrama para tarea

1. "Ayuda" - Familiarizarse con comandos
2. "Crear tabla" - Tabla "estudiantes"
3. "Crear tabla" - Tabla "cursos"
4. "Crear tabla" - Tabla "inscripciones"
5. [Crear conexiones manualmente]
6. "Estadísticas" - Verificar
7. "Guardar como Tarea BD"
```

### Caso 2: Desarrollador Importando Schema
```
Objetivo: Visualizar base de datos existente

1. "Importar SQL"
2. [Pegar CREATE TABLE statements]
3. "Estadísticas" - Ver cuántas tablas
4. "Zoom 125" - Ajustar vista
5. "Guardar como Schema Producción"
```

### Caso 3: Arquitecto Explorando Plantillas
```
Objetivo: Empezar rápido con plantilla

1. "Plantillas"
2. [Seleccionar "E-commerce"]
3. "Estadísticas" - Ver estructura
4. "Crear tabla" - Agregar tabla custom
5. "Guardar como Proyecto Cliente X"
```

## Preguntas Frecuentes

### ¿El asistente entiende lenguaje natural complejo?
Actualmente reconoce comandos específicos. Usa frases simples y directas.

### ¿Puedo usar el asistente con teclado?
Sí, escribe tu comando y presiona Enter para enviar.

### ¿Las conversaciones se guardan?
El historial se mantiene durante la sesión actual. Al recargar, inicia nuevo.

### ¿Puedo personalizar los comandos?
Sí, puedes modificar el código en `chat-assistant.service.ts`.

### ¿Funciona en móvil?
Sí, el chat es responsive y funciona en dispositivos táctiles.

## Próximas Funcionalidades

- 🎤 Comandos de voz
- 🤖 IA para entender lenguaje más natural
- 📝 Historial persistente
- ⌨️ Atajos de teclado personalizables
- 🌙 Modo oscuro
- 📤 Exportar conversación
- 🔔 Notificaciones inteligentes
- 🎨 Temas personalizables

## Feedback

¿Tienes ideas para mejorar el asistente? ¡Escribe "ayuda" y cuéntanos!
