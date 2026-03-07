# 🎯 Instrucciones para Probar la Nueva Funcionalidad

## 📋 Resumen

Se ha implementado exitosamente la funcionalidad de **carga de documentos** para generar diagramas automáticamente. La aplicación está compilada, corriendo y lista para probar.

---

## ✅ Estado Actual

```
✅ Compilación: EXITOSA
✅ Servidor: CORRIENDO en http://localhost:4200/
✅ Errores: NINGUNO
✅ Documentación: COMPLETA
```

---

## 🚀 Cómo Probar (Paso a Paso)

### 1️⃣ Abrir la Aplicación

1. Abre tu navegador (Chrome, Firefox, Edge)
2. Ve a: **http://localhost:4200/**
3. Deberías ver la pantalla de login

### 2️⃣ Iniciar Sesión

Usa estas credenciales:
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- Click en "Iniciar Sesión"

### 3️⃣ Ubicar el Nuevo Botón

En la barra de herramientas superior, busca:
- **Botón 📄** (color azul claro)
- Está entre el botón del asistente 🧙‍♂️ y las plantillas 📋
- Al pasar el mouse dice: "Cargar documento"

### 4️⃣ Probar con Texto Manual (Más Rápido)

1. **Click en el botón 📄**
2. Se abre un modal con título "📄 Cargar Documento"
3. **Desplázate hacia abajo** hasta ver "O pega el contenido aquí:"
4. **Copia y pega este texto:**

```
Sistema de Gestión de Restaurante

Necesitamos gestionar Clientes, Mesas, Pedidos y Platos.

Los Clientes tienen nombre, teléfono y dirección.
Las Mesas tienen número y capacidad.
Los Platos tienen nombre, precio y categoría.
Los Pedidos pertenecen a un Cliente y una Mesa.

Proceso de Atención:
1. Cliente llega y se le asigna una Mesa
2. Cliente revisa el menú
3. Cliente hace el Pedido
4. Cocina prepara los Platos
5. Mesero sirve la comida
6. Cliente paga la cuenta
```

5. **Click en "Procesar Texto"**
6. Espera 1-2 segundos
7. Deberías ver:
   - ✅ Tipo: "Entrevista" 🎤
   - ✅ Entidades detectadas (4-6)
   - ✅ Relaciones detectadas (2-4)
   - ✅ Proceso con 6 pasos

8. **Click en "✨ Generar Diagrama"**
9. El modal se cierra y aparece un diagrama con:
   - Tablas de base de datos
   - Conexiones entre ellas
   - Nombres de las entidades detectadas

### 5️⃣ Probar con Archivo de Ejemplo

1. **Click en el botón 📄** nuevamente
2. Si ya procesaste texto, click en "← Cargar Otro"
3. **Arrastra el archivo** `ejemplo-entrevista.txt` al área de drag & drop
   - O click en el área y selecciona el archivo
4. El archivo se procesa automáticamente
5. Verás un análisis más completo:
   - Tipo: Entrevista
   - 5-8 entidades (Libros, Usuarios, Empleados, etc.)
   - Múltiples relaciones
   - Procesos detectados
6. **Click en "✨ Generar Diagrama"**
7. Se genera un diagrama completo de biblioteca

### 6️⃣ Probar desde el Chat Asistente

1. **Click en el botón 🧙‍♂️** (asistente)
2. En el chat, escribe: `Cargar documento`
3. Presiona Enter
4. El modal de carga se abre automáticamente
5. Procede como en los pasos anteriores

---

## 🎨 Qué Esperar

### Con el Texto de Ejemplo (Restaurante)
- **Diagrama tipo:** Entidad-Relación (ER)
- **Tablas creadas:** Clientes, Mesas, Pedidos, Platos
- **Columnas:** id, nombre, fecha_creacion (básicas)
- **Conexiones:** Entre tablas relacionadas
- **Layout:** Organizado en cuadrícula 3x3

### Con ejemplo-entrevista.txt (Biblioteca)
- **Diagrama tipo:** Entidad-Relación (ER)
- **Tablas creadas:** Libros, Usuarios, Empleados, Préstamos, Multas
- **Más complejo:** Más entidades y relaciones
- **Más realista:** Sistema completo

### Con ejemplo-proceso-produccion.txt (Calzado)
- **Diagrama tipo:** Flujo de Proceso
- **Elementos:** Inicio → Pasos → Fin
- **Pasos:** 12 pasos del proceso de fabricación
- **Layout:** Vertical, secuencial

---

## ✅ Checklist de Verificación

Marca cada item que funcione correctamente:

### Interfaz
- [ ] El botón 📄 aparece en el toolbar
- [ ] El botón tiene color azul claro
- [ ] Al hacer click se abre el modal
- [ ] El modal tiene título "📄 Cargar Documento"
- [ ] Hay un área de drag & drop
- [ ] Hay un área de texto manual
- [ ] El botón × cierra el modal

### Procesamiento de Texto
- [ ] Puedo pegar texto en el área
- [ ] El botón "Procesar Texto" se habilita
- [ ] Al procesar muestra la vista previa
- [ ] Muestra el tipo de documento
- [ ] Muestra las entidades detectadas
- [ ] Muestra las relaciones (si hay)
- [ ] Muestra los procesos (si hay)

### Generación de Diagrama
- [ ] El botón "✨ Generar Diagrama" funciona
- [ ] El modal se cierra
- [ ] Aparece un diagrama en el canvas
- [ ] El diagrama tiene formas (tablas o rectángulos)
- [ ] Las formas tienen texto
- [ ] Hay conexiones entre formas
- [ ] Puedo mover las formas
- [ ] Puedo editar el diagrama

### Carga de Archivos
- [ ] Puedo arrastrar archivos al área
- [ ] El área cambia de color al arrastrar
- [ ] Al soltar procesa el archivo
- [ ] Puedo hacer click y seleccionar archivo
- [ ] Archivos .txt funcionan
- [ ] Archivos grandes (>5MB) son rechazados

### Chat Asistente
- [ ] El comando "Cargar documento" funciona
- [ ] El modal se abre automáticamente
- [ ] El comando "Ayuda" menciona la carga
- [ ] El comando "Comandos" lista la opción

### Sin Errores
- [ ] No hay errores en consola (F12)
- [ ] No hay warnings críticos
- [ ] La página no se congela
- [ ] Todo responde rápido

---

## 🐛 Problemas Comunes y Soluciones

### Problema: No veo el botón 📄
**Solución:**
1. Verifica que estás en la página del editor (no en login o galería)
2. Refresca la página (F5)
3. Verifica que el servidor esté corriendo
4. Abre la consola (F12) y busca errores

### Problema: El modal no se abre
**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Intenta desde el chat asistente
4. Refresca la página

### Problema: "Procesar Texto" no hace nada
**Solución:**
1. Verifica que el texto tenga al menos 50 caracteres
2. Verifica que no esté vacío (solo espacios)
3. Intenta con el texto de ejemplo proporcionado
4. Revisa la consola por errores

### Problema: No se genera el diagrama
**Solución:**
1. Verifica que se haya procesado el documento
2. Verifica que haya entidades o procesos detectados
3. Si no detecta nada, el texto puede ser muy genérico
4. Intenta con los archivos de ejemplo

### Problema: El diagrama está vacío
**Solución:**
1. El texto puede no tener entidades detectables
2. Intenta usar palabras clave como: "tabla", "entidad", "proceso"
3. Usa los archivos de ejemplo que sí funcionan
4. Revisa la vista previa antes de generar

---

## 📊 Qué Reportar

Si encuentras errores, anota:

1. **Pasos exactos** que seguiste
2. **Qué esperabas** que pasara
3. **Qué pasó** en realidad
4. **Errores en consola** (F12 → Console tab)
5. **Captura de pantalla** (si es posible)

### Ejemplo de Reporte:
```
Pasos:
1. Abrí el modal de carga
2. Pegué el texto de ejemplo
3. Click en "Procesar Texto"

Esperaba: Ver la vista previa del análisis
Pasó: El botón no hace nada

Error en consola:
TypeError: Cannot read property 'trim' of undefined
  at DocumentProcessorService.processDocument
```

---

## 📚 Documentación Adicional

Si quieres más información:

- **Guía completa:** `docs/CARGA_DOCUMENTOS.md`
- **Detalles técnicos:** `FUNCIONALIDAD_CARGA_DOCUMENTOS.md`
- **Estado de la app:** `ESTADO_APLICACION.md`
- **Pruebas completas:** `test-funcionalidad.md`

---

## 🎉 Siguiente Nivel

Una vez que todo funcione:

1. **Experimenta** con tus propios documentos
2. **Edita** los diagramas generados
3. **Guarda** en la galería
4. **Exporta** como imagen
5. **Comparte** con otros usuarios

---

## ⏱️ Tiempo Estimado

- **Prueba básica:** 5 minutos
- **Prueba completa:** 15 minutos
- **Experimentación:** 30+ minutos

---

## 🆘 Ayuda

Si necesitas ayuda:
1. Revisa `PRUEBA_RAPIDA.md` para guía paso a paso
2. Revisa `ESTADO_APLICACION.md` para estado técnico
3. Abre la consola del navegador (F12) para ver errores
4. Verifica que el servidor esté corriendo en http://localhost:4200/

---

**¡Buena suerte con las pruebas! 🚀**

La funcionalidad está lista y esperando ser probada. Todo debería funcionar correctamente según las pruebas automatizadas.
