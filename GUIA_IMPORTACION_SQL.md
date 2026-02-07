# 📥 Guía de Importación SQL

## 🎯 Cómo Importar Archivos SQL

El Diagramador SQL puede importar archivos `.sql` y crear automáticamente el diagrama con todas las tablas y sus relaciones.

---

## ✨ Características de la Importación

### ✅ Lo que se Detecta Automáticamente

1. **Tablas (CREATE TABLE)**
   - Nombres de tablas
   - Columnas con sus tipos de datos
   - Claves primarias (PRIMARY KEY)
   - Claves foráneas (FOREIGN KEY)

2. **Relaciones**
   - FOREIGN KEY en formato constraint
   - FOREIGN KEY inline en la definición de columna
   - Referencias REFERENCES

3. **Formatos Soportados**
   ```sql
   -- Formato 1: Constraint separado
   CREATE TABLE pedidos (
     id INT PRIMARY KEY,
     usuario_id INT,
     FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
   );
   
   -- Formato 2: Inline en la columna
   CREATE TABLE pedidos (
     id INT PRIMARY KEY,
     usuario_id INT REFERENCES usuarios(id)
   );
   
   -- Formato 3: Con IF NOT EXISTS
   CREATE TABLE IF NOT EXISTS pedidos (
     id INT PRIMARY KEY,
     usuario_id INT,
     CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
   );
   ```

---

## 📋 Pasos para Importar

### 1. Preparar el Archivo SQL

Asegúrate de que tu archivo SQL tenga:
- Sentencias `CREATE TABLE` completas
- Definiciones de `FOREIGN KEY` si quieres ver las relaciones
- Sintaxis válida de SQL

### 2. Importar en el Diagramador

```
1. Abre el Diagramador SQL
2. Click en el botón "Importar" en el toolbar
3. Selecciona tu archivo .sql
4. ¡Listo! El diagrama se genera automáticamente
```

### 3. Verificar el Resultado

El sistema mostrará:
- ✅ Número de tablas importadas
- ✅ Número de relaciones detectadas
- ⚠️ Advertencias si hay problemas

---

## 🔍 Ejemplo Completo

### Archivo SQL de Entrada

```sql
-- Sistema de E-commerce

CREATE TABLE usuarios (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100),
  fecha_registro DATE
);

CREATE TABLE categorias (
  id INT PRIMARY KEY,
  nombre VARCHAR(50),
  descripcion TEXT
);

CREATE TABLE productos (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),
  precio DECIMAL(10,2),
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE pedidos (
  id INT PRIMARY KEY,
  usuario_id INT,
  fecha DATE,
  total DECIMAL(10,2),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE detalle_pedidos (
  id INT PRIMARY KEY,
  pedido_id INT,
  producto_id INT,
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

### Resultado Esperado

```
✅ SQL importado: 5 tabla(s), 4 relación(es)

Diagrama generado con:
- usuarios
- categorias  
- productos → categorias
- pedidos → usuarios
- detalle_pedidos → pedidos
- detalle_pedidos → productos
```

---

## 🐛 Solución de Problemas

### ❓ "No se detectaron tablas CREATE TABLE"

**Causas posibles:**
- El archivo no contiene sentencias CREATE TABLE
- La sintaxis SQL es incorrecta
- Hay errores de formato

**Solución:**
1. Verifica que el archivo tenga CREATE TABLE
2. Revisa la sintaxis SQL
3. Prueba con un archivo más simple primero

---

### ❓ "Las tablas se importan pero sin conexiones"

**Causas posibles:**
- No hay FOREIGN KEY definidas
- Los nombres de tablas no coinciden
- Formato de FOREIGN KEY no reconocido

**Solución:**
1. Verifica que las FOREIGN KEY estén definidas
2. Asegúrate de que los nombres de tablas sean exactos
3. Usa uno de los formatos soportados (ver arriba)
4. Revisa la consola del navegador (F12) para ver logs detallados

**Ejemplo de problema:**
```sql
-- ❌ INCORRECTO - nombre no coincide
CREATE TABLE Usuarios (id INT PRIMARY KEY);
CREATE TABLE pedidos (
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)  -- 'usuarios' != 'Usuarios'
);

-- ✅ CORRECTO - nombres coinciden
CREATE TABLE usuarios (id INT PRIMARY KEY);
CREATE TABLE pedidos (
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

---

### ❓ "Se importan tablas duplicadas"

**Causa:**
- El archivo SQL tiene múltiples CREATE TABLE para la misma tabla

**Solución:**
1. Limpia el archivo SQL
2. Asegúrate de que cada tabla se cree solo una vez
3. Usa `CREATE TABLE IF NOT EXISTS` si es necesario

---

### ❓ "Algunas columnas no aparecen"

**Causas posibles:**
- Sintaxis de columna incorrecta
- Constraints complejos que se interpretan como columnas

**Solución:**
1. Verifica la sintaxis de cada columna
2. Asegúrate de que cada columna tenga nombre y tipo
3. Revisa los logs en la consola (F12)

---

## 💡 Tips y Mejores Prácticas

### 1. Nombres de Tablas Consistentes
```sql
-- ✅ BUENO - nombres consistentes
CREATE TABLE usuarios (...);
FOREIGN KEY (...) REFERENCES usuarios(id);

-- ❌ MALO - inconsistente
CREATE TABLE Usuarios (...);
FOREIGN KEY (...) REFERENCES usuarios(id);  -- No coincide
```

### 2. Definir FOREIGN KEY Explícitamente
```sql
-- ✅ BUENO - FK explícita
CREATE TABLE pedidos (
  id INT PRIMARY KEY,
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ⚠️ FUNCIONA pero menos claro
CREATE TABLE pedidos (
  id INT PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id)
);
```

### 3. Usar Comentarios para Documentar
```sql
-- Tabla principal de usuarios del sistema
CREATE TABLE usuarios (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100)
);

-- Pedidos realizados por los usuarios
CREATE TABLE pedidos (
  id INT PRIMARY KEY,
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### 4. Agrupar Tablas Relacionadas
```sql
-- Módulo de Usuarios
CREATE TABLE usuarios (...);
CREATE TABLE perfiles (...);

-- Módulo de Productos
CREATE TABLE categorias (...);
CREATE TABLE productos (...);

-- Módulo de Ventas
CREATE TABLE pedidos (...);
CREATE TABLE detalle_pedidos (...);
```

---

## 🔧 Debugging Avanzado

### Ver Logs Detallados

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Console"
3. Importa tu archivo SQL
4. Verás logs detallados como:

```
=== INICIO IMPORTACIÓN SQL ===
SQL original (primeros 500 chars): CREATE TABLE...
SQL limpio (primeros 500 chars): CREATE TABLE...

--- Tabla 1: usuarios ---
Contenido de columnas: id INT PRIMARY KEY, nombre VARCHAR(100)...
Líneas de columnas: ["id INT PRIMARY KEY", "nombre VARCHAR(100)"]
Columnas procesadas: [{name: "id", type: "INT", pk: true}, ...]
Forma creada: {id: "t-usuarios-1234567890", name: "usuarios"}

=== RESUMEN ===
Total tablas encontradas: 5
Nombres de tablas: ["usuarios", "categorias", "productos", ...]
Total FKs detectadas: 4
Detalle de FKs: [{fromTable: "productos", toTable: "categorias"}, ...]

=== CONEXIONES FINALES ===
Total conexiones creadas: 4
```

### Interpretar los Logs

- **"Tabla X: nombre"**: Se detectó una tabla
- **"FK detectada"**: Se encontró una clave foránea
- **"Forma creada"**: La tabla se agregó al diagrama
- **"Conexión creada"**: Se creó una relación
- **"NO ENCONTRADA"**: Error - tabla referenciada no existe

---

## 📊 Formatos SQL Soportados

### MySQL
```sql
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE
);
```

### PostgreSQL
```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE
);
```

### SQL Server
```sql
CREATE TABLE usuarios (
  id INT IDENTITY(1,1) PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE
);
```

### SQLite
```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  email TEXT UNIQUE
);
```

---

## 🎯 Casos de Uso

### 1. Documentar Base de Datos Existente
```
1. Exporta el schema de tu BD (mysqldump, pg_dump, etc.)
2. Importa el .sql en el Diagramador
3. Obtén un diagrama visual automáticamente
4. Guarda en la galería para referencia
```

### 2. Diseñar Nueva Base de Datos
```
1. Escribe el SQL en tu editor favorito
2. Importa en el Diagramador para visualizar
3. Ajusta el diseño visualmente
4. Exporta el SQL actualizado
```

### 3. Revisar Schema de Proyecto
```
1. Importa el schema.sql del proyecto
2. Revisa las relaciones visualmente
3. Identifica problemas o mejoras
4. Comparte el diagrama con el equipo
```

---

## 🚀 Próximas Mejoras

### En Desarrollo
- [ ] Soporte para vistas (CREATE VIEW)
- [ ] Detección de índices
- [ ] Importar triggers y procedures
- [ ] Soporte para schemas/namespaces

### Planeadas
- [ ] Validación de integridad referencial
- [ ] Sugerencias de optimización
- [ ] Exportar a diferentes dialectos SQL
- [ ] Comparar dos schemas

---

## 📚 Recursos Adicionales

### Archivos de Ejemplo
- `test-sql-import.sql` - Ejemplo básico de e-commerce
- Ver carpeta `examples/` para más casos

### Documentación Relacionada
- `README.md` - Guía general del Diagramador
- `MEJORAS_IMPLEMENTADAS.md` - Todas las funcionalidades
- `GUIA_RAPIDA.md` - Tutorial de uso

---

## 🆘 Soporte

Si tienes problemas con la importación:

1. **Revisa esta guía** - La mayoría de problemas están documentados
2. **Verifica la consola** - Los logs te dirán qué está pasando
3. **Prueba con archivo simple** - Empieza con 2-3 tablas
4. **Revisa la sintaxis SQL** - Usa un validador online

---

**Última actualización**: 2026-02-07  
**Versión**: 1.0.0
