# 🔧 Corrección: Regex de Importación SQL

## 🐛 Problema Identificado

Al importar archivos SQL, el contenido de las columnas se cortaba prematuramente, impidiendo la detección de FOREIGN KEY.

### Logs del Problema

```
--- Tabla 3: productos ---
Contenido de columnas:  id INT PRIMARY KEY, nombre VARCHAR(100
                                                           ↑ CORTADO!

Total FKs detectadas: 0  ← DEBERÍA SER > 0
Total conexiones creadas: 0  ← DEBERÍA SER > 0
```

---

## 🔍 Causa Raíz

### Regex Anterior (Problemático)

```typescript
// ❌ PROBLEMA: [\s\S]*? es non-greedy y se detiene en el primer )
const tableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:`)?([a-zA-Z0-9_]+)(?:`)?\s*\(([\s\S]*?)\);?/gi;
```

**Por qué fallaba:**

1. `([\s\S]*?)` es **non-greedy** (el `?` lo hace perezoso)
2. Se detiene en el **primer `)` que encuentra**
3. En SQL con paréntesis anidados (como `VARCHAR(100)`), se cortaba prematuramente

**Ejemplo:**
```sql
CREATE TABLE productos (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),  ← Se detiene aquí en el )
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);
```

Capturaba solo: `id INT PRIMARY KEY, nombre VARCHAR(100`

---

## ✅ Solución Implementada

### Regex Nuevo (Correcto)

```typescript
// ✅ SOLUCIÓN: Captura correctamente paréntesis anidados
const tableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:`)?([a-zA-Z0-9_]+)(?:`)?\s*\(((?:[^()]|\([^)]*\))*)\)\s*;?/gi;
```

**Cómo funciona:**

1. `((?:[^()]|\([^)]*\))*)` - Captura todo excepto paréntesis, O paréntesis balanceados
2. `[^()]` - Cualquier carácter que NO sea `(` o `)`
3. `|\([^)]*\)` - O un par de paréntesis con contenido dentro
4. `*` - Repetir 0 o más veces
5. Se detiene en el `)` que cierra el CREATE TABLE

**Ejemplo:**
```sql
CREATE TABLE productos (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);
```

Ahora captura correctamente: `id INT PRIMARY KEY, nombre VARCHAR(100), categoria_id INT, FOREIGN KEY (categoria_id) REFERENCES categorias(id)`

---

## 📊 Comparación

### Antes (Regex Antiguo)

```
Input SQL:
CREATE TABLE productos (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

Capturado:
"id INT PRIMARY KEY, nombre VARCHAR(100"
                                      ↑ CORTADO

Resultado:
- Columnas: 2 (id, nombre)
- FKs detectadas: 0 ❌
- Conexiones: 0 ❌
```

### Después (Regex Nuevo)

```
Input SQL:
CREATE TABLE productos (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

Capturado:
"id INT PRIMARY KEY, nombre VARCHAR(100), categoria_id INT, FOREIGN KEY (categoria_id) REFERENCES categorias(id)"
                                                                                                                  ↑ COMPLETO

Resultado:
- Columnas: 3 (id, nombre, categoria_id)
- FKs detectadas: 1 ✅
- Conexiones: 1 ✅
```

---

## 🧪 Casos de Prueba

### Caso 1: Paréntesis en Tipos de Datos

```sql
CREATE TABLE test (
  col1 VARCHAR(100),
  col2 DECIMAL(10,2),
  col3 CHAR(50)
);
```

**Antes:** Se cortaba en `VARCHAR(100`  
**Ahora:** ✅ Captura completo

---

### Caso 2: FOREIGN KEY con Paréntesis

```sql
CREATE TABLE test (
  id INT,
  ref_id INT,
  FOREIGN KEY (ref_id) REFERENCES other(id)
);
```

**Antes:** No detectaba la FK  
**Ahora:** ✅ Detecta la FK correctamente

---

### Caso 3: Múltiples Paréntesis Anidados

```sql
CREATE TABLE test (
  col1 VARCHAR(100),
  col2 DECIMAL(10,2),
  FOREIGN KEY (col1) REFERENCES t1(id),
  FOREIGN KEY (col2) REFERENCES t2(id)
);
```

**Antes:** Se cortaba en el primer paréntesis  
**Ahora:** ✅ Captura todo correctamente

---

## 🔬 Explicación Técnica del Regex

### Desglose del Patrón

```regex
CREATE\s+TABLE                    # Literal "CREATE TABLE"
(?:\s+IF\s+NOT\s+EXISTS)?         # Opcional "IF NOT EXISTS"
\s+                               # Espacios
(?:`)?                            # Opcional backtick
([a-zA-Z0-9_]+)                   # GRUPO 1: Nombre de tabla
(?:`)?                            # Opcional backtick
\s*                               # Espacios opcionales
\(                                # Paréntesis de apertura
  (                               # GRUPO 2: Contenido (inicio)
    (?:                           # Grupo no capturador
      [^()]                       # Cualquier cosa excepto paréntesis
      |                           # O
      \([^)]*\)                   # Par de paréntesis balanceados
    )*                            # Repetir 0 o más veces
  )                               # GRUPO 2: Contenido (fin)
\)                                # Paréntesis de cierre
\s*;?                             # Espacios y punto y coma opcional
```

### Ejemplos de Captura

```
Input: "CREATE TABLE t (a INT, b VARCHAR(10));"
Grupo 1: "t"
Grupo 2: "a INT, b VARCHAR(10)"  ← Correcto!

Input: "CREATE TABLE t (a INT, FOREIGN KEY (a) REFERENCES x(id));"
Grupo 1: "t"
Grupo 2: "a INT, FOREIGN KEY (a) REFERENCES x(id)"  ← Correcto!
```

---

## 📝 Cambios en el Código

### Archivo: `src/app/services/diagram.service.ts`

```typescript
// ANTES
const tableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:`)?([a-zA-Z0-9_]+)(?:`)?\s*\(([\s\S]*?)\);?/gi;

// DESPUÉS
const tableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:`)?([a-zA-Z0-9_]+)(?:`)?\s*\(((?:[^()]|\([^)]*\))*)\)\s*;?/gi;
```

### Logs Mejorados

```typescript
// NUEVO: Logs más detallados
console.log('Contenido de columnas (completo):', columnsText);
console.log('Longitud:', columnsText.length, 'caracteres');
console.log('Total líneas encontradas:', colLines.length);
colLines.forEach((line, idx) => {
  console.log(`  Línea ${idx + 1}:`, line.substring(0, 80));
});
```

---

## ✅ Verificación

### Cómo Verificar que Funciona

1. Abre la consola (F12)
2. Importa `test-sql-import.sql`
3. Verifica los logs:

```
✅ Contenido de columnas (completo): [debe estar completo, no cortado]
✅ Longitud: [debe ser > 50 caracteres para tablas con FK]
✅ Total FKs detectadas: 4 [debe ser > 0]
✅ Total conexiones creadas: 4 [debe ser > 0]
```

### Resultado Esperado

```
=== RESUMEN ===
Total tablas encontradas: 5
Total FKs detectadas: 4  ← ✅ CORRECTO
Total conexiones creadas: 4  ← ✅ CORRECTO

✅ SQL importado: 5 tabla(s), 4 relación(es)
```

---

## 🎓 Lecciones Aprendidas

### 1. Non-Greedy vs Greedy

```regex
.*?  # Non-greedy: se detiene lo antes posible
.*   # Greedy: captura lo máximo posible
```

Para SQL con paréntesis anidados, necesitamos un enfoque diferente.

### 2. Paréntesis Balanceados

```regex
[^()]        # Todo excepto paréntesis
\([^)]*\)    # O paréntesis balanceados
```

Esto permite capturar `VARCHAR(100)` sin cortarse.

### 3. Testing con Casos Reales

Siempre probar con SQL real que incluya:
- Tipos con paréntesis: `VARCHAR(100)`, `DECIMAL(10,2)`
- FOREIGN KEY con paréntesis: `FOREIGN KEY (col) REFERENCES t(id)`
- Múltiples constraints

---

## 📚 Referencias

### Regex Resources
- [Regex101](https://regex101.com/) - Probador de regex online
- [MDN Regex Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

### SQL Standards
- [SQL CREATE TABLE Syntax](https://www.w3schools.com/sql/sql_create_table.asp)
- [SQL FOREIGN KEY](https://www.w3schools.com/sql/sql_foreignkey.asp)

---

## 🔄 Próximas Mejoras

### Regex Aún Más Robusto

Para casos extremos con múltiples niveles de anidación:

```typescript
// Futuro: Usar un parser real en lugar de regex
// Considerar: sql-parser-cst, node-sql-parser
```

### Validación de SQL

```typescript
// Futuro: Validar sintaxis antes de parsear
// Mostrar errores específicos de sintaxis
```

---

**Fecha de corrección**: 2026-02-07  
**Desarrollador**: Kiro AI Assistant  
**Estado**: ✅ Corregido y verificado  
**Versión**: 1.1.1
