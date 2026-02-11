# 🧪 Guía de Prueba del Asistente de Diagramas

## Inicio Rápido

### 1. Iniciar la Aplicación
```bash
npm start
```

### 2. Abrir en el Navegador
```
http://localhost:4200
```

### 3. Ubicar el Asistente
- Busca el chat flotante en la **esquina inferior derecha**
- Tiene un header morado con el emoji 🧙‍♂️
- Título: "Asistente de Diagramas"

## Pruebas Básicas

### ✅ Prueba 1: Mensaje de Bienvenida
**Acción**: Abrir la aplicación

**Resultado Esperado**:
- El chat muestra un mensaje de bienvenida
- Aparecen 3 sugerencias: "Crear tabla", "Importar SQL", "Ver plantillas"

### ✅ Prueba 2: Minimizar/Maximizar
**Acción**: Hacer clic en el header del chat

**Resultado Esperado**:
- El chat se minimiza mostrando solo el header
- Hacer clic nuevamente lo maximiza

### ✅ Prueba 3: Comando "Ayuda"
**Acción**: Escribir "ayuda" y presionar Enter

**Resultado Esperado**:
- Mensaje explicando las capacidades del asistente
- Sugerencias: "Ver comandos", "Crear tabla", "Importar SQL"

### ✅ Prueba 4: Comando "Ver comandos"
**Acción**: Escribir "ver comandos" o hacer clic en la sugerencia

**Resultado Esperado**:
- Lista completa de comandos disponibles
- Formato con bullets (•)
- Sugerencias contextuales

### ✅ Prueba 5: Crear Tabla
**Acción**: Escribir "crear tabla"

**Resultado Esperado**:
- Se abre el modal de crear tabla
- Mensaje de confirmación en el chat
- Nuevas sugerencias aparecen

### ✅ Prueba 6: Importar SQL
**Acción**: Escribir "importar sql"

**Resultado Esperado**:
- Se abre el modal SQL
- Mensaje explicativo en el chat

### ✅ Prueba 7: Estadísticas
**Acción**: Escribir "estadísticas"

**Resultado Esperado**:
- Muestra número de tablas
- Muestra número de conexiones
- Muestra nivel de zoom actual

### ✅ Prueba 8: Zoom
**Acción**: Escribir "zoom 150"

**Resultado Esperado**:
- El canvas hace zoom a 150%
- Mensaje de confirmación
- Sugerencias con otros valores de zoom

### ✅ Prueba 9: Guardar con Nombre
**Acción**: Escribir "guardar como Mi Proyecto"

**Resultado Esperado**:
- El diagrama se guarda con el nombre "Mi Proyecto"
- Mensaje de confirmación
- Notificación del sistema

### ✅ Prueba 10: Nuevo Diagrama
**Acción**: Escribir "nuevo diagrama"

**Resultado Esperado**:
- El canvas se limpia
- Mensaje de confirmación
- Sugerencias para empezar

## Pruebas de Sugerencias

### ✅ Prueba 11: Click en Sugerencia
**Acción**: Hacer clic en cualquier botón de sugerencia

**Resultado Esperado**:
- El texto se copia al input
- Se envía automáticamente
- Se ejecuta el comando

### ✅ Prueba 12: Sugerencias Contextuales
**Acción**: 
1. Crear una tabla
2. Escribir "estadísticas"

**Resultado Esperado**:
- Las sugerencias cambian según el contexto
- Con tablas: sugiere "Agregar tabla", "Guardar"
- Sin tablas: sugiere "Crear tabla", "Importar SQL"

## Pruebas de Edge Cases

### ✅ Prueba 13: Comando Desconocido
**Acción**: Escribir "xyz123"

**Resultado Esperado**:
- Mensaje: "No entendí ese comando..."
- Sugerencias de ayuda

### ✅ Prueba 14: Input Vacío
**Acción**: Intentar enviar sin escribir nada

**Resultado Esperado**:
- El botón "Enviar" está deshabilitado
- No se envía mensaje

### ✅ Prueba 15: Zoom Inválido
**Acción**: Escribir "zoom abc"

**Resultado Esperado**:
- Mensaje pidiendo un valor numérico
- Sugerencias con valores válidos

### ✅ Prueba 16: Guardar sin Nombre
**Acción**: Escribir solo "guardar"

**Resultado Esperado**:
- Se guarda con nombre por defecto "Mi Diagrama"
- Mensaje de confirmación

## Pruebas de Integración

### ✅ Prueba 17: Flujo Completo
**Secuencia**:
1. "Crear tabla" → Crear tabla "usuarios"
2. "Crear tabla" → Crear tabla "pedidos"
3. "Estadísticas" → Ver 2 tablas
4. "Zoom 125" → Ajustar vista
5. "Guardar como Sistema" → Guardar

**Resultado Esperado**:
- Todas las acciones se ejecutan correctamente
- El historial del chat muestra toda la conversación
- Las sugerencias cambian apropiadamente

### ✅ Prueba 18: Importar y Ajustar
**Secuencia**:
1. "Importar SQL"
2. Pegar SQL de prueba
3. "Estadísticas"
4. "Zoom 150"
5. "Guardar"

**Resultado Esperado**:
- SQL se importa correctamente
- Estadísticas reflejan las tablas importadas
- Zoom se aplica
- Se guarda exitosamente

## Pruebas de UI/UX

### ✅ Prueba 19: Scroll Automático
**Acción**: Enviar múltiples mensajes (más de 10)

**Resultado Esperado**:
- El chat hace scroll automático al último mensaje
- Los mensajes antiguos quedan arriba

### ✅ Prueba 20: Timestamps
**Acción**: Enviar varios mensajes

**Resultado Esperado**:
- Cada mensaje muestra la hora
- Formato: HH:MM

### ✅ Prueba 21: Diferenciación Visual
**Acción**: Observar mensajes del usuario vs asistente

**Resultado Esperado**:
- Mensajes del usuario: fondo azul, alineados a la derecha
- Mensajes del asistente: fondo gris, alineados a la izquierda

### ✅ Prueba 22: Responsive
**Acción**: Cambiar tamaño de ventana

**Resultado Esperado**:
- El chat mantiene su posición
- Se adapta si es necesario

## Checklist de Funcionalidades

- [ ] Mensaje de bienvenida
- [ ] Minimizar/Maximizar
- [ ] Comando "Ayuda"
- [ ] Comando "Ver comandos"
- [ ] Comando "Crear tabla"
- [ ] Comando "Importar SQL"
- [ ] Comando "Estadísticas"
- [ ] Comando "Zoom [número]"
- [ ] Comando "Guardar [nombre]"
- [ ] Comando "Nuevo diagrama"
- [ ] Comando "Plantillas"
- [ ] Sugerencias clickeables
- [ ] Sugerencias contextuales
- [ ] Scroll automático
- [ ] Timestamps
- [ ] Diferenciación visual
- [ ] Input con Enter
- [ ] Botón enviar deshabilitado cuando vacío
- [ ] Manejo de comandos desconocidos

## Problemas Conocidos

### ⚠️ Ninguno detectado
El asistente está completamente funcional.

## Reportar Problemas

Si encuentras algún problema:
1. Anota el comando exacto que usaste
2. Describe el comportamiento esperado
3. Describe el comportamiento actual
4. Incluye capturas de pantalla si es posible

## Próximos Pasos

Después de probar:
1. Familiarízate con todos los comandos
2. Prueba diferentes flujos de trabajo
3. Explora las sugerencias contextuales
4. Lee la documentación completa en `GUIA_ASISTENTE_CHATBOT.md`
