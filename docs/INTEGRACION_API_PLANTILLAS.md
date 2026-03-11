# 📚 Integración de API de Plantillas de Esquemas

## 🎯 Descripción

Se ha implementado una integración con **DummyJSON API** (https://dummyjson.com) para proporcionar plantillas de esquemas de bases de datos predefinidas que los usuarios pueden generar automáticamente en el diagramador.

## ✨ Características

### Plantillas Disponibles

1. **E-Commerce** 🛒
   - Sistema completo de comercio electrónico
   - Tablas: products, users, carts, cart_items
   - Relaciones: usuarios → carritos → items → productos

2. **Blog/Red Social** 📝
   - Sistema de blog con interacciones
   - Tablas: users, posts, comments
   - Relaciones: usuarios → posts → comentarios

3. **Recetas de Cocina** 🍳
   - Gestión de recetas e ingredientes
   - Tablas: recipes, ingredients, recipe_ingredients, instructions
   - Relaciones: recetas ↔ ingredientes (muchos a muchos)

4. **Citas y Autores** 💭
   - Sistema de citas célebres
   - Tablas: authors, quotes
   - Relaciones: autores → citas

## 🔧 Componentes Implementados

### 1. SchemaGeneratorService
**Ubicación**: `src/app/services/schema-generator.service.ts`

**Responsabilidades**:
- Gestión de plantillas de esquemas
- Generación de SQL a partir de plantillas
- Integración con DummyJSON API
- Filtrado por categorías

**Métodos principales**:
```typescript
- templates(): SchemaTemplate[] // Obtener todas las plantillas
- generateSQL(template): string // Generar SQL de una plantilla
- getTemplateById(id): SchemaTemplate // Obtener plantilla por ID
- getTemplatesByCategory(category): SchemaTemplate[] // Filtrar por categoría
- getAllCategories(): string[] // Obtener categorías disponibles
- fetchSampleData(endpoint): Promise<any> // Obtener datos de ejemplo de la API
```

### 2. SchemaTemplatesModalComponent
**Ubicación**: `src/app/components/schema-templates-modal/schema-templates-modal.component.ts`

**Características**:
- Interfaz visual para seleccionar plantillas
- Filtrado por categorías
- Vista previa de tablas y columnas
- Generación automática de esquemas
- Descarga de SQL generado

**Funcionalidades**:
- ✅ Selección de plantilla
- ✅ Vista previa de estructura
- ✅ Generación automática en el canvas
- ✅ Descarga de SQL
- ✅ Filtrado por categorías

## 🚀 Uso

### Desde la Interfaz

1. **Abrir el modal**:
   - Menú: `Archivo` → `Plantillas de Esquemas`
   - Atajo: Próximamente

2. **Seleccionar plantilla**:
   - Filtrar por categoría (Todos, Negocios, Contenido, Gastronomía)
   - Click en la tarjeta de la plantilla deseada
   - Ver vista previa de tablas y columnas

3. **Generar esquema**:
   - Click en "✨ Generar Esquema"
   - El esquema se crea automáticamente en el canvas
   - Las relaciones se establecen automáticamente

4. **Descargar SQL**:
   - Click en "👁️ Ver SQL"
   - Se descarga un archivo `.sql` con el esquema completo

### Desde el Código

```typescript
// Inyectar el servicio
constructor(private schemaGenerator: SchemaGeneratorService) {}

// Obtener plantillas
const templates = this.schemaGenerator.templates();

// Generar SQL
const template = this.schemaGenerator.getTemplateById('ecommerce');
const sql = this.schemaGenerator.generateSQL(template);

// Obtener datos de ejemplo
const data = await this.schemaGenerator.fetchSampleData('/products');
```

## 📊 Estructura de Datos

### SchemaTemplate
```typescript
interface SchemaTemplate {
  id: string;                    // Identificador único
  name: string;                  // Nombre de la plantilla
  description: string;           // Descripción
  category: string;              // Categoría
  endpoint: string;              // Endpoint de la API
  tables: TableSchema[];         // Tablas del esquema
}
```

### TableSchema
```typescript
interface TableSchema {
  name: string;                  // Nombre de la tabla
  columns: ColumnSchema[];       // Columnas
  primaryKey: string;            // Clave primaria
  foreignKeys?: ForeignKeySchema[]; // Claves foráneas
}
```

### ColumnSchema
```typescript
interface ColumnSchema {
  name: string;                  // Nombre de la columna
  type: string;                  // Tipo de dato SQL
  nullable: boolean;             // Permite NULL
  unique?: boolean;              // Es única
}
```

## 🔌 API Utilizada

### DummyJSON API
- **URL Base**: https://dummyjson.com
- **Autenticación**: No requiere
- **Límites**: Sin límites de uso
- **Documentación**: https://dummyjson.com/docs

### Endpoints Utilizados
- `/products` - Productos de e-commerce
- `/users` - Usuarios
- `/carts` - Carritos de compra
- `/posts` - Posts de blog
- `/comments` - Comentarios
- `/recipes` - Recetas de cocina
- `/quotes` - Citas célebres

## 🎨 Interfaz de Usuario

### Modal de Plantillas
- **Diseño**: Grid responsivo de tarjetas
- **Filtros**: Botones de categoría
- **Vista previa**: Expandible con detalles de tablas
- **Acciones**: Generar esquema, Ver SQL, Cancelar

### Tarjetas de Plantilla
- Icono representativo
- Nombre y descripción
- Badges con información (número de tablas, categoría)
- Hover effect
- Selección visual

## 🔄 Flujo de Trabajo

```
Usuario abre modal
    ↓
Selecciona categoría (opcional)
    ↓
Selecciona plantilla
    ↓
Ve vista previa
    ↓
Click en "Generar Esquema"
    ↓
Servicio genera SQL
    ↓
DiagramService importa SQL
    ↓
Esquema aparece en canvas
    ↓
Notificación de éxito
```

## 🛠️ Configuración

### Requisitos
- Angular 17+
- HttpClient configurado en app.config.ts
- DiagramService con método importSQL()
- NotificationService para feedback

### Instalación
```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers
    provideHttpClient()
  ]
};
```

## 📝 SQL Generado

### Ejemplo de SQL Generado
```sql
-- Schema: E-Commerce
-- Sistema completo de comercio electrónico con productos, usuarios, carritos y órdenes
-- Generated from DummyJSON API

CREATE TABLE products (
  id INT NOT NULL UNIQUE PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  category VARCHAR(100) NOT NULL
);

CREATE TABLE users (
  id INT NOT NULL UNIQUE PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE
);

-- Foreign Keys
ALTER TABLE carts
  ADD CONSTRAINT fk_carts_userId
  FOREIGN KEY (userId)
  REFERENCES users(id);

-- Indexes
CREATE INDEX idx_carts_userId ON carts(userId);
```

## 🎯 Casos de Uso

### 1. Aprendizaje
- Estudiantes pueden explorar esquemas reales
- Ver ejemplos de relaciones bien diseñadas
- Aprender patrones de diseño de BD

### 2. Prototipado Rápido
- Generar esquemas base rápidamente
- Modificar según necesidades específicas
- Ahorrar tiempo en diseño inicial

### 3. Demostración
- Mostrar capacidades del diagramador
- Ejemplos visuales de esquemas complejos
- Presentaciones y tutoriales

### 4. Testing
- Datos de prueba estructurados
- Esquemas consistentes para tests
- Validación de funcionalidades

## 🔮 Mejoras Futuras

### Corto Plazo
- [ ] Más plantillas (Biblioteca, Hospital, Escuela, etc.)
- [ ] Personalización de plantillas antes de generar
- [ ] Búsqueda de plantillas
- [ ] Favoritos

### Mediano Plazo
- [ ] Plantillas personalizadas del usuario
- [ ] Compartir plantillas entre usuarios
- [ ] Importar plantillas desde URL
- [ ] Plantillas con datos de ejemplo

### Largo Plazo
- [ ] Marketplace de plantillas
- [ ] Plantillas de la comunidad
- [ ] Generación de plantillas con IA
- [ ] Plantillas específicas por industria

## 📊 Métricas

### Plantillas Disponibles
- Total: 4 plantillas
- Categorías: 3 (Negocios, Contenido, Gastronomía)
- Tablas totales: 13 tablas
- Relaciones: 8 relaciones

### Código
- Servicio: ~250 líneas
- Componente: ~400 líneas
- Interfaces: ~50 líneas
- Total: ~700 líneas

## 🐛 Solución de Problemas

### Error: HttpClient no disponible
**Solución**: Agregar `provideHttpClient()` en app.config.ts

### Error: No se genera el esquema
**Solución**: Verificar que DiagramService tenga el método `loadExternalSql()`

### Error: Modal no se muestra
**Solución**: Verificar que el signal `showSchemaTemplates` esté correctamente configurado

### Error: Las tablas no se conectan
**Problema**: Las foreign keys se generaban con ALTER TABLE separado  
**Solución**: ✅ Corregido - Ahora se generan inline dentro del CREATE TABLE  
**Formato correcto**:
```sql
CREATE TABLE carts (
  id INT NOT NULL PRIMARY KEY,
  userId INT NOT NULL,
  CONSTRAINT fk_carts_userId FOREIGN KEY (userId) REFERENCES users(id)
);
```

## 📚 Referencias

- [DummyJSON API Docs](https://dummyjson.com/docs)
- [Angular HttpClient](https://angular.io/guide/http)
- [Angular Signals](https://angular.io/guide/signals)

---

**Fecha de implementación**: 7 de Marzo de 2026  
**Versión**: 1.0.0  
**Estado**: ✅ Implementado y funcional
