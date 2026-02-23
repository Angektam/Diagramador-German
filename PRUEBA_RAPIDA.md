# 🚀 Guía de Prueba Rápida - Carga de Documentos

## ⚡ Prueba en 5 Minutos

### Paso 1: Iniciar la Aplicación ✅
```bash
# El servidor ya está corriendo en:
http://localhost:4200/
```

### Paso 2: Login
1. Abrir http://localhost:4200/
2. Usar credenciales: `admin` / `admin123`
3. Click en "Iniciar Sesión"

### Paso 3: Probar Carga de Documento

#### Opción A: Desde el Toolbar (Recomendado)
1. Buscar el botón **📄** (azul) en el toolbar
2. Hacer clic
3. Debería abrirse un modal con título "📄 Cargar Documento"

#### Opción B: Desde el Chat Asistente
1. Hacer clic en el botón **🧙‍♂️** (amarillo/dorado)
2. Escribir: `Cargar documento`
3. Presionar Enter
4. El modal debería abrirse automáticamente

### Paso 4: Probar con Texto Manual

**Copiar y pegar este texto:**

```
Entrevista - Sistema de Ventas

El cliente necesita gestionar Clientes, Productos y Ventas.

Cada Cliente tiene nombre, email y teléfono.
Los Productos tienen nombre, precio y stock.
Las Ventas pertenecen a un Cliente y contienen varios Productos.

Proceso de Venta:
1. Cliente selecciona productos
2. Se crea la venta
3. Se actualiza el stock
4. Se genera la factura
```

**Pasos:**
1. Pegar el texto en el área de texto del modal
2. Click en "Procesar Texto"
3. Verificar que muestra:
   - Tipo: "Entrevista" 🎤
   - Entidades: Clientes, Productos, Ventas
   - Relaciones detectadas
   - Proceso con 4 pasos
4. Click en "✨ Generar Diagrama"
5. Verificar que se crea un diagrama con tablas

### Paso 5: Probar con Archivo de Ejemplo

1. Abrir el modal de carga
2. Click en "← Cargar Otro" (si ya procesaste texto)
3. Arrastrar el archivo `ejemplo-entrevista.txt` al área de drag & drop
   - O hacer click y seleccionar el archivo
4. Esperar el procesamiento
5. Verificar el análisis
6. Click en "✨ Generar Diagrama"

## ✅ Checklist Rápido

- [ ] El botón 📄 aparece en el toolbar
- [ ] El modal se abre al hacer click
- [ ] El área de texto funciona
- [ ] El botón "Procesar Texto" funciona
- [ ] Se muestra la vista previa del análisis
- [ ] El botón "Generar Diagrama" crea el diagrama
- [ ] El diagrama tiene formas y conexiones
- [ ] No hay errores en la consola del navegador (F12)

## 🐛 Si Encuentras Errores

### Error: El botón 📄 no aparece
**Solución:**
- Verificar que estás en la página del editor (no en login o galería)
- Refrescar la página (F5)
- Verificar la consola del navegador (F12)

### Error: El modal no se abre
**Solución:**
- Verificar errores en consola (F12)
- Intentar desde el chat asistente
- Refrescar la página

### Error: "Procesar Texto" no hace nada
**Solución:**
- Verificar que el texto tiene al menos 50 caracteres
- Verificar que no está vacío
- Ver errores en consola

### Error: No se genera el diagrama
**Solución:**
- Verificar que se procesó el documento
- Verificar que hay entidades o procesos detectados
- Ver errores en consola

## 📊 Resultados Esperados

### Con el texto de ejemplo:
- **Tipo detectado:** Entrevista 🎤
- **Entidades:** 3-5 (Clientes, Productos, Ventas, etc.)
- **Relaciones:** 2-4 conexiones
- **Diagrama:** Tablas con columnas básicas conectadas

### Con ejemplo-entrevista.txt:
- **Tipo detectado:** Entrevista 🎤
- **Entidades:** 5-8 (Libros, Usuarios, Empleados, Préstamos, Multas, etc.)
- **Relaciones:** 5-10 conexiones
- **Diagrama:** Sistema completo de biblioteca

### Con ejemplo-proceso-produccion.txt:
- **Tipo detectado:** Proceso de Producción ⚙️
- **Procesos:** 1 proceso con 12 pasos
- **Diagrama:** Flujo con inicio → pasos → fin

## 🎯 Funcionalidades Adicionales a Probar

### 1. Editar el Diagrama Generado
- Mover formas
- Agregar nuevas formas
- Crear conexiones
- Cambiar colores

### 2. Guardar en Galería
- Click en 📁 "Guardar en galería"
- Ingresar nombre
- Verificar que se guarda

### 3. Exportar
- Click en 📸 "Exportar como imagen"
- Seleccionar PNG o SVG
- Verificar descarga

### 4. Comandos del Chat
Probar estos comandos en el asistente:
- `Cargar documento`
- `Importar entrevista`
- `Cargar proceso`
- `Ayuda`
- `Comandos`

## 📝 Reportar Problemas

Si encuentras errores, anota:
1. **Qué estabas haciendo** (pasos exactos)
2. **Qué esperabas** que pasara
3. **Qué pasó** en realidad
4. **Errores en consola** (F12 → Console)
5. **Captura de pantalla** (si es posible)

## 🎉 Todo Funciona?

Si todas las pruebas pasan:
- ✅ La funcionalidad está lista para usar
- ✅ Puedes empezar a crear diagramas desde documentos
- ✅ Comparte con otros usuarios

---

**Tiempo estimado:** 5-10 minutos
**Dificultad:** Fácil
**Requisitos:** Navegador moderno, servidor corriendo
