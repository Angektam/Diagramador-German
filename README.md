# Diagramador SQL

Aplicación web para crear diagramas de bases de datos de forma visual e intuitiva.

## 🚀 Inicio Rápido

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo**
   ```bash
   npm start
   ```

3. **Abrir en navegador**
   ```
   http://localhost:4200
   ```

4. **Login con credenciales demo**
   - Admin: `admin` / `admin123`
   - Usuario: `usuario` / `123456`
   - Demo: `demo` / `demo`

## 📚 Documentación

Toda la documentación está consolidada en un solo archivo:

👉 **[DOCUMENTACION_COMPLETA.md](./DOCUMENTACION_COMPLETA.md)**

Incluye:
- Guía rápida de uso
- Características principales
- Asistente de diagramas (Chat + Wizard)
- Canvas y controles
- Validaciones de seguridad
- Mejoras implementadas
- Solución de problemas

## ✨ Características Destacadas

- 🎨 **Canvas ilimitado** (10000x10000px) con scrollbars
- 🗺️ **Minimapa interactivo** arrastrable
- 📥 **Importación SQL** con detección automática de relaciones
- 🧙‍♂️ **Asistente inteligente** con generación automática de BD
- 📋 **Copiar/Pegar** con multi-selección (Ctrl+C/V/D)
- 🔍 **Zoom** 25-200% con Ctrl+Wheel
- 📱 **Soporte táctil** completo (panning + pinch zoom)
- 🔒 **Validaciones** completas de seguridad
- ⌨️ **Atajos de teclado** para productividad

## 🛠️ Tecnologías

- Angular 17 (Standalone Components)
- TypeScript
- SVG para renderizado
- Signals para reactividad
- CSS moderno con variables

## 📦 Estructura del Proyecto

```
src/
├── app/
│   ├── components/     # Componentes UI
│   ├── services/       # Lógica de negocio
│   ├── models/         # Interfaces y tipos
│   └── guards/         # Protección de rutas
├── assets/             # Recursos estáticos
└── styles.css          # Estilos globales
```

## 🎯 Comandos Útiles

```bash
# Desarrollo
npm start

# Build producción
npm run build

# Tests
npm test

# Linting
npm run lint
```

## 📄 Licencia

Este proyecto es de código abierto.

---

**Nota**: Para información detallada sobre uso, características y validaciones, consulta [DOCUMENTACION_COMPLETA.md](./DOCUMENTACION_COMPLETA.md)
