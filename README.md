# Diagramador SQL

Aplicación web para crear diagramas de bases de datos de forma visual e intuitiva.

## 📁 Estructura del Proyecto

```
diagramador/
├── frontend/          # Aplicación Angular (actualmente en raíz)
├── backend/           # API Node.js/Express (preparado)
├── shared/            # Tipos e interfaces compartidas
├── docs/              # Documentación completa
└── README.md          # Este archivo
```

## 🚀 Inicio Rápido

### Frontend (Angular)

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

### Backend (Preparado para desarrollo futuro)

```bash
cd backend
npm install
npm run dev
```

El backend estará disponible en `http://localhost:3000`

## 📚 Documentación

Toda la documentación está organizada en la carpeta `docs/`:

### Documentos Principales
- 👉 **[docs/README.md](./docs/README.md)** - Índice de toda la documentación
- 📖 **[docs/INDICE_DOCUMENTACION.md](./docs/INDICE_DOCUMENTACION.md)** - Índice completo detallado
- 📐 **[docs/ARQUITECTURA_REORGANIZACION.md](./docs/ARQUITECTURA_REORGANIZACION.md)** - Arquitectura del sistema
- 📄 **[docs/DOCUMENTACION_COMPLETA.md](./docs/DOCUMENTACION_COMPLETA.md)** - Guía completa de uso
- 🚀 **[docs/GUIA_DESARROLLO.md](./docs/GUIA_DESARROLLO.md)** - Guía para desarrolladores

### Categorías
- 📁 **[docs/ejemplos/](./docs/ejemplos/)** - Ejemplos de uso (entrevistas, procesos)
- 📁 **[docs/pruebas/](./docs/pruebas/)** - Documentación de pruebas y casos de test
- 📁 **[docs/resumenes/](./docs/resumenes/)** - Resúmenes ejecutivos y visuales

### Documentación por módulo
- Frontend: Este archivo (README.md)
- Backend: [backend/README.md](./backend/README.md)
- Shared: [shared/README.md](./shared/README.md)

## ✨ Características Destacadas

- 🎨 **Canvas ilimitado** (10000x10000px) con scrollbars
- 🗺️ **Minimapa interactivo** arrastrable
- 📥 **Importación SQL** con detección automática de relaciones
- 📄 **Carga de documentos** (entrevistas, procesos, requisitos) con generación automática
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

## 📦 Estructura Frontend (Angular)

```
src/
├── app/
│   ├── components/     # Componentes UI
│   │   ├── canvas/           # Canvas principal
│   │   ├── toolbar/          # Barra de herramientas
│   │   ├── shapes-panel/     # Panel de formas
│   │   ├── format-panel/     # Panel de formato
│   │   ├── chat-assistant/   # Asistente IA
│   │   ├── diagram-wizard/   # Wizard de diagramas
│   │   └── ...
│   ├── services/       # Lógica de negocio
│   │   ├── diagram.service.ts
│   │   ├── auth.service.ts
│   │   ├── chat-assistant.service.ts
│   │   └── validation.service.ts
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

**Nota**: Para información detallada sobre uso, características y validaciones, consulta [docs/DOCUMENTACION_COMPLETA.md](./docs/DOCUMENTACION_COMPLETA.md)

## 🗺️ Roadmap

- ✅ Frontend Angular completo con todas las funcionalidades
- 🔄 Backend API REST (estructura preparada)
- 📋 Base de datos PostgreSQL
- 🔐 Autenticación JWT
- 💾 Persistencia de diagramas
- 🤝 Colaboración en tiempo real
- 📤 Exportación avanzada (PNG, SVG, PDF)
