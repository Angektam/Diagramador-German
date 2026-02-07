# 🐛 Debug: Importación SQL

## 🔍 Cómo Verificar que Funciona

### Paso 1: Abrir la Consola del Navegador

1. Presiona **F12** (o Ctrl+Shift+I)
2. Ve a la pestaña **Console**
3. Limpia la consola (icono 🚫 o Ctrl+L)

### Paso 2: Importar el Archivo SQL

1. Click en **"Importar"** en el toolbar
2. Selecciona `test-simple.sql` o `test-sql-import.sql`
3. Observa los logs en la consola

### Paso 3: Interpretar los Logs

#### ✅ Logs Correctos (Funcionando)

```
=== INICIO IMPORTACIÓN SQL ===
SQL original (primeros 500 chars): CREATE TABLE usuarios...

--- Tabla 1: usuarios ---
Contenido de columnas (completo): id INT PRIMARY KEY, nombre VARCHAR(100)
Longitud: 35 caracteres
Total líneas encontradas: 2
  Línea 1: id INT PRIMARY KEY
  Línea 2: nombre VARCHAR(100)
Columnas procesadas: [{name: "id", type: "INT", pk: true}, ...]

--- Tabla 2: pedidos ---
Contenido de columnas (completo): id INT PRIMARY KEY, usuario_id INT, FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
Longitud: 95 caracteres
Total líneas encontradas: 3
  Línea 1: id INT PRIMARY KEY
  Línea 2: usuario_id INT
  Línea 3: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
FK detectada (constraint): {from: "pedidos.usuario_id", to: "usuarios.id"}

=== RESUMEN ===
Total tablas encontradas: 2
Total FKs detectadas: 1  ← ✅ DEBE SER > 0

=== CONEXIONES FINALES ===
Total conexiones creadas: 1  ← ✅ DEBE SER > 0
```

#### ❌ Logs Incorrectos (Problema)

```
=== INICIO IMPORTACIÓN SQL ===

--- Tabla 1: usuarios ---
Contenido de columnas (completo): id INT PRIMARY KEY, nombre VARCHAR(100  ← ❌ CORTADO!
Longitud: 35 caracteres
Total líneas encontradas: 2

--- Tabla 2: pedidos ---
Contenido de columnas (completo): id INT PRIMARY KEY, usuario_id INT, fecha DATE, total DECIMAL(10,2  ← ❌ CORTADO!
Total líneas encontradas: 5
  Línea 3: 2  ← ❌ LÍNEA INVÁLIDA

=== RESUMEN ===
Total FKs detectadas: 0  ← ❌ DEBERÍA SER > 0
Total conexiones creadas: 0  ← ❌ DEBERÍA SER > 0
```

---

## 🔧 Problemas Comunes

### Problema 1: "Contenido de columnas" se corta

**Síntoma:**
```
Contenido de columnas: id INT PRIMARY KEY, nombre VARCHAR(100
                                                           ↑ cortado aquí
```

**Causa:**
El regex no está capturando correctamente el contenido completo de la tabla.

**Solución:**
Ya está corregido en la última versión del código. Asegúrate de tener la versión actualizada.

---

### Problema 2: "Total FKs detectadas: 0"

**Síntoma:**
```
Total FKs detectadas: 0
```

**Causas posibles:**

1. **El SQL no tiene FOREIGN KEY**
   ```sql
   -- ❌ Sin FK
   CREATE TABLE pedidos (
     id INT PRIMARY KEY,
     usuario_id INT  -- No hay FOREIGN KEY
   );
   ```

2. **Formato de FK no reconocido**
   ```sql
   -- ❌ Formato no estándar
   CREATE TABLE pedidos (
     usuario_id INT CONSTRAINT fk_user FOREIGN KEY REFERENCES usuarios(id)
   );
   ```

3. **Contenido cortado** (ver Problema 1)

**Solución:**
Usa uno de estos formatos:

```sql
-- ✅ Formato 1: Constraint separado
CREATE TABLE pedidos (
  id INT PRIMARY KEY,
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ✅ Formato 2: Inline
CREATE TABLE pedidos (
  id INT PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id)
);
```

---

### Problema 3: "Línea inválida (muy corta)"

**Síntoma:**
```
Línea inválida (muy corta): 2
```

**Causa:**
El split de columnas está generando líneas con solo números o caracteres sueltos.

**Solución:**
Esto indica que el contenido se está cortando. Verifica que el "Contenido de columnas" esté completo.

---

### Problema 4: "Tabla no encontrada" al crear conexión

**Síntoma:**
```
FK detectada: productos.categoria_id -> categorias.id
Forma origen encontrada: t-productos-123
Forma destino encontrada: NO ENCONTRADA  ← ❌
```

**Causa:**
La tabla referenciada no existe en el SQL o tiene un nombre diferente.

**Solución:**
```sql
-- ❌ MALO - tabla no existe
CREATE TABLE productos (
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)  -- categorias no existe
);

-- ✅ BUENO - tabla existe
CREATE TABLE categorias (id INT PRIMARY KEY);
CREATE TABLE productos (
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);
```

---

## 🧪 Archivos de Prueba

### test-simple.sql (Básico)
```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY,
  nombre VARCHAR(100)
);

CREATE TABLE pedidos (
  id INT PRIMARY KEY,
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

**Resultado esperado:**
- 2 tablas
- 1 conexión

### test-sql-import.sql (Completo)
```sql
-- 5 tablas con múltiples relaciones
-- Ver archivo completo
```

**Resultado esperado:**
- 5 tablas
- 4 conexiones

---

## 📊 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] La consola está abierta (F12)
- [ ] Los logs muestran "=== INICIO IMPORTACIÓN SQL ==="
- [ ] "Contenido de columnas (completo)" está completo (no cortado)
- [ ] "Total líneas encontradas" es correcto
- [ ] No hay "Línea inválida (muy corta)"
- [ ] "Total FKs detectadas" > 0 (si tu SQL tiene FKs)
- [ ] "Total conexiones creadas" > 0 (si tu SQL tiene FKs)

---

## 🔬 Prueba Manual

### 1. Prueba con SQL Mínimo

```sql
CREATE TABLE a (id INT PRIMARY KEY);
CREATE TABLE b (
  id INT PRIMARY KEY,
  a_id INT,
  FOREIGN KEY (a_id) REFERENCES a(id)
);
```

**Debe mostrar:**
- 2 tablas
- 1 FK detectada
- 1 conexión creada

### 2. Prueba sin FK

```sql
CREATE TABLE a (id INT PRIMARY KEY);
CREATE TABLE b (id INT PRIMARY KEY);
```

**Debe mostrar:**
- 2 tablas
- 0 FKs detectadas
- 0 conexiones creadas
- ✅ Esto es correcto (no hay FKs)

### 3. Prueba con FK Inline

```sql
CREATE TABLE a (id INT PRIMARY KEY);
CREATE TABLE b (
  id INT PRIMARY KEY,
  a_id INT REFERENCES a(id)
);
```

**Debe mostrar:**
- 2 tablas
- 1 FK detectada (inline)
- 1 conexión creada

---

## 🆘 Si Nada Funciona

1. **Copia el SQL completo** que estás intentando importar
2. **Copia todos los logs** de la consola
3. **Toma captura** del diagrama resultante
4. **Verifica** que estás usando la última versión del código

---

## 📝 Logs Útiles para Reportar

Si necesitas ayuda, incluye estos logs:

```
=== INICIO IMPORTACIÓN SQL ===
[Copia todo desde aquí]

--- Tabla 1: nombre ---
Contenido de columnas (completo): [IMPORTANTE]
Longitud: X caracteres
Total líneas encontradas: X

[... todas las tablas ...]

=== RESUMEN ===
Total tablas encontradas: X
Total FKs detectadas: X  ← IMPORTANTE
Detalle de FKs: [...]

=== CONEXIONES FINALES ===
Total conexiones creadas: X  ← IMPORTANTE

[Hasta aquí]
```

---

**Última actualización**: 2026-02-07  
**Versión**: 1.1.0
