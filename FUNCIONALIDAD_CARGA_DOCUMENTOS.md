# Funcionalidad de Carga de Documentos - Implementación Completa

## 📋 Resumen

Se ha implementado una funcionalidad completa para cargar documentos (entrevistas, procesos de producción, requisitos, etc.) y generar diagramas automáticamente a partir de su contenido.

## 🎯 Componentes Creados

### 1. Servicio de Procesamiento de Documentos
**Archivo:** `src/app/services/document-processor.service.ts`

**Funcionalidades:**
- Detección automática del tipo de documento (entrevista, proceso, requisitos, general)
- Extracción de entidades mediante análisis de texto
- Identificación de relaciones entre conceptos
- Extracción de procesos con pasos numerados
- Generación de diagramas según el tipo de documento

**Métodos principales:**
- `processDocument()` - Procesa el contenido del documento
- `generateDiagramFromDocument()` - Genera el diagrama correspondiente
- `extractEntities()` - Extrae entidades del texto
- `extractRelationships()` - Identifica relaciones
- `extractProcesses()` - Extrae procesos y sus pasos

### 2. Componente de Carga de Documentos
**Archivo:** `src/app/components/document-uploader/document-uploader.component.ts`

**Características:**
- Modal con interfaz intuitiva
- Soporte para drag & drop de archivos
- Área de texto para pegar contenido manualmente
- Vista previa del análisis del documento
- Validaciones de tamaño (máx 5MB) y formato

**Formatos soportados:**
- `.txt` - Archivos de texto plano
- `.md` - Archivos Markdown
- `.doc` / `.docx` - Documentos Word (preparado)
- `.pdf` - Documentos PDF (preparado)
- Texto manual (copiar y pegar)

### 3. Integración con el Sistema

**Toolbar actualizado:**
- Nuevo botón 📄 "Cargar documento" en la barra de herramientas
- Integración con el componente de carga

**Chat Asistente actualizado:**
- Nuevo comando: "Cargar documento"
- Comando: "Importar entrevista"
- Comando: "Cargar proceso"
- Ayuda actualizada con la nueva funcionalidad

## 🔍 Tipos de Análisis

### 1. Entrevistas 🎤
**Detecta:**
- Entidades mencionadas (Clientes, Productos, Ventas, etc.)
- Relaciones entre entidades
- Atributos importantes

**Genera:**
- Diagrama de entidad-relación (ER)
- Tablas con columnas básicas
- Conexiones entre tablas según relaciones detectadas

### 2. Procesos de Producción ⚙️
**Detecta:**
- Pasos del proceso (listas numeradas)
- Secuencia de actividades
- Puntos de decisión

**Genera:**
- Diagrama de flujo
- Formas conectadas secuencialmente
- Inicio y fin del proceso

### 3. Requisitos 📋
**Detecta:**
- Componentes del sistema
- Módulos y servicios
- Dependencias

**Genera:**
- Diagrama de componentes
- Arquitectura del sistema
- Relaciones entre componentes

### 4. Documentos Generales 📄
**Detecta:**
- Conceptos clave
- Términos importantes
- Estructura básica

**Genera:**
- Diagrama genérico
- Representación visual de conceptos

## 📝 Ejemplos Incluidos

### 1. ejemplo-entrevista.txt
Entrevista completa sobre un sistema de gestión de biblioteca con:
- Entidades: Libros, Usuarios, Empleados, Préstamos, Multas
- Procesos: Préstamo y devolución de libros
- Reglas de negocio
- Reportes necesarios

### 2. ejemplo-proceso-produccion.txt
Proceso detallado de fabricación de calzado deportivo con:
- 12 pasos principales del proceso
- Procesos de soporte
- Indicadores de producción
- Puntos críticos de control

## 🎨 Interfaz de Usuario

### Modal de Carga
- **Área de drag & drop** con indicador visual
- **Selector de archivos** tradicional
- **Área de texto manual** para copiar/pegar
- **Vista previa del análisis** con:
  - Tipo de documento detectado
  - Lista de entidades encontradas
  - Relaciones identificadas
  - Procesos extraídos

### Botones de Acción
- **Procesar Texto** - Analiza el texto pegado
- **Cargar Otro** - Reinicia el proceso
- **✨ Generar Diagrama** - Crea el diagrama

## 🔧 Validaciones Implementadas

### Seguridad
- Validación de tamaño máximo (5MB)
- Sanitización de contenido
- Prevención de XSS
- Validación de tipos de archivo

### Calidad
- Verificación de contenido vacío
- Longitud mínima de texto (50 caracteres)
- Límite de entidades (15 máximo)
- Límite de relaciones (20 máximo)

## 📊 Algoritmos de Procesamiento

### Detección de Entidades
```typescript
Patrones utilizados:
- "tabla|entidad|clase|modelo de [Nombre]"
- "el|la|los|las [Nombre]"
- "[Nombre] tiene|contiene|incluye"
```

### Extracción de Relaciones
```typescript
Patrones detectados:
- "tiene" / "contiene" → Relación de composición
- "pertenece a" → Relación de pertenencia
- "se relaciona con" → Relación genérica
- "depende de" → Dependencia
```

### Identificación de Procesos
```typescript
Patrones reconocidos:
- Listas numeradas: "1.", "2.", "3."
- Listas con viñetas: "-", "•"
- Palabras clave: "proceso:", "procedimiento:", "flujo:"
```

## 🚀 Cómo Usar

### Opción 1: Desde el Toolbar
1. Clic en el botón 📄 "Cargar documento"
2. Arrastra un archivo o selecciona uno
3. Revisa el análisis
4. Genera el diagrama

### Opción 2: Desde el Chat
1. Abre el asistente 🧙‍♂️
2. Escribe: "Cargar documento"
3. Se abre el modal automáticamente

### Opción 3: Texto Manual
1. Abre el modal de carga
2. Pega el contenido en el área de texto
3. Clic en "Procesar Texto"
4. Genera el diagrama

## 📈 Mejoras Futuras

### Corto Plazo
- [ ] Soporte real para archivos PDF
- [ ] Soporte real para archivos Word (.docx)
- [ ] Mejora de algoritmos de detección

### Mediano Plazo
- [ ] Integración con IA (GPT) para análisis más preciso
- [ ] Detección automática de tipos de datos
- [ ] Generación de SQL desde documentos
- [ ] Sugerencias de mejora del diagrama

### Largo Plazo
- [ ] Análisis de imágenes (diagramas escaneados)
- [ ] Reconocimiento de voz para entrevistas
- [ ] Colaboración en tiempo real
- [ ] Historial de versiones de documentos

## 🎓 Documentación

- **Guía completa:** `docs/CARGA_DOCUMENTOS.md`
- **Ejemplos:** `ejemplo-entrevista.txt`, `ejemplo-proceso-produccion.txt`
- **README actualizado** con información de la funcionalidad

## ✅ Testing

### Casos de Prueba Recomendados

1. **Carga de archivo válido**
   - Cargar ejemplo-entrevista.txt
   - Verificar detección de entidades
   - Generar diagrama

2. **Texto manual**
   - Pegar contenido de ejemplo
   - Procesar y verificar análisis
   - Generar diagrama

3. **Validaciones**
   - Intentar cargar archivo > 5MB
   - Intentar procesar texto vacío
   - Intentar procesar texto muy corto

4. **Integración con chat**
   - Comando "Cargar documento"
   - Verificar apertura del modal
   - Completar flujo

## 🎉 Resultado Final

La funcionalidad está completamente implementada y lista para usar. Los usuarios pueden:

1. ✅ Cargar documentos de texto
2. ✅ Ver análisis automático del contenido
3. ✅ Generar diagramas automáticamente
4. ✅ Editar los diagramas generados
5. ✅ Guardar en la galería
6. ✅ Exportar como imagen o SQL

La implementación es robusta, segura y fácil de usar, con una interfaz intuitiva y validaciones completas.
