# Carga de Documentos para Generar Diagramas

## Descripción

Esta funcionalidad permite cargar documentos de texto (entrevistas, procesos de producción, requisitos, etc.) y generar automáticamente diagramas a partir de su contenido.

## Características

### Tipos de Documentos Soportados

1. **Entrevistas** 🎤
   - Detecta entidades mencionadas
   - Identifica relaciones entre conceptos
   - Genera diagramas de entidad-relación

2. **Procesos de Producción** ⚙️
   - Extrae pasos del proceso
   - Identifica flujos de trabajo
   - Genera diagramas de flujo

3. **Requisitos** 📋
   - Detecta componentes del sistema
   - Identifica dependencias
   - Genera diagramas de componentes

4. **Documentos Generales** 📄
   - Análisis genérico de contenido
   - Extracción de conceptos clave
   - Generación de diagramas básicos

### Formatos Soportados

- `.txt` - Archivos de texto plano
- `.md` - Archivos Markdown
- `.doc` / `.docx` - Documentos de Word (próximamente)
- `.pdf` - Documentos PDF (próximamente)
- Texto manual (copiar y pegar)

## Cómo Usar

### Opción 1: Cargar Archivo

1. Haz clic en el botón **📄 Cargar documento** en la barra de herramientas
2. Arrastra un archivo o haz clic para seleccionar
3. El sistema procesará el documento automáticamente
4. Revisa las entidades, relaciones y procesos detectados
5. Haz clic en **✨ Generar Diagrama**

### Opción 2: Pegar Texto

1. Haz clic en el botón **📄 Cargar documento**
2. Pega el contenido en el área de texto
3. Haz clic en **Procesar Texto**
4. Revisa el análisis
5. Genera el diagrama

### Opción 3: Desde el Chat Asistente

1. Abre el asistente con el botón **🧙‍♂️**
2. Escribe: "Cargar documento" o "Importar entrevista"
3. Se abrirá automáticamente el modal de carga

## Ejemplos de Documentos

### Ejemplo 1: Entrevista con Cliente

```
Entrevista con el cliente - Sistema de Ventas

P: ¿Qué información necesitas almacenar?
R: Necesitamos gestionar clientes, productos y ventas. Cada cliente puede hacer múltiples compras.

P: ¿Qué datos de los clientes son importantes?
R: Nombre, email, teléfono y dirección.

P: ¿Y de los productos?
R: Nombre, precio, stock y categoría.

P: ¿Cómo se relacionan las ventas?
R: Cada venta pertenece a un cliente y puede incluir varios productos.
```

**Resultado:** Diagrama de entidad-relación con tablas Clientes, Productos, Ventas y DetalleVentas.

### Ejemplo 2: Proceso de Producción

```
Proceso de Fabricación de Calzado

1. Recepción de materia prima
2. Control de calidad de materiales
3. Corte de piezas
4. Costura y ensamblaje
5. Pegado de suelas
6. Control de calidad final
7. Empaquetado
8. Almacenamiento
```

**Resultado:** Diagrama de flujo con todos los pasos conectados secuencialmente.

### Ejemplo 3: Requisitos de Sistema

```
Requisitos del Sistema de E-commerce

El sistema debe incluir:
- Frontend web responsivo
- API REST para servicios
- Base de datos relacional
- Sistema de caché Redis
- Cola de mensajes para procesamiento asíncrono
- Servicio de notificaciones
- Gateway de pagos
```

**Resultado:** Diagrama de arquitectura con componentes y sus conexiones.

## Procesamiento Inteligente

El sistema utiliza análisis de texto para:

### Detección de Entidades
- Sustantivos importantes (Clientes, Productos, Ventas)
- Conceptos clave del dominio
- Actores del sistema

### Extracción de Relaciones
- "tiene" / "contiene" → Relación de composición
- "pertenece a" → Relación de pertenencia
- "se relaciona con" → Relación genérica
- "depende de" → Dependencia

### Identificación de Procesos
- Listas numeradas (1., 2., 3.)
- Listas con viñetas (-, •)
- Palabras clave: "proceso", "procedimiento", "flujo"

## Limitaciones

- Máximo 5MB por archivo
- Hasta 15 entidades detectadas
- Hasta 20 relaciones procesadas
- El análisis es automático y puede requerir ajustes manuales

## Consejos para Mejores Resultados

1. **Usa lenguaje claro y estructurado**
   - Evita ambigüedades
   - Usa términos consistentes

2. **Estructura el contenido**
   - Usa listas numeradas para procesos
   - Separa conceptos en párrafos

3. **Menciona relaciones explícitamente**
   - "El cliente tiene pedidos"
   - "El producto pertenece a una categoría"

4. **Incluye detalles relevantes**
   - Nombres de entidades
   - Tipos de relaciones
   - Pasos del proceso

## Integración con Otras Funcionalidades

- Los diagramas generados pueden editarse manualmente
- Se pueden guardar en la galería
- Compatible con exportación a imagen/SQL
- Funciona con el sistema de plantillas

## Próximas Mejoras

- [ ] Soporte para archivos PDF
- [ ] Soporte para archivos Word (.docx)
- [ ] Análisis con IA más avanzado
- [ ] Detección de tipos de datos
- [ ] Generación de SQL automática
- [ ] Sugerencias de mejora del diagrama
