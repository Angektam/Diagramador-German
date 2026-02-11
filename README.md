# Diagramador con Asistente IA 🧙‍♂️

## Nuevo: Asistente de Diagramas

Tu compañero inteligente para crear diagramas de bases de datos mediante comandos de texto natural.

### Características del Asistente
- 💬 Chat interactivo flotante
- 🎯 Comandos en lenguaje natural
- 💡 Sugerencias contextuales inteligentes
- ⚡ Acceso rápido a todas las funciones
- 📊 Información en tiempo real del diagrama

[Ver Guía Completa del Asistente](GUIA_ASISTENTE_CHATBOT.md)

---

# Diagramador (Angular)

Aplicación de diagramas tipo draw.io/diagrams.net: creador de diagramas de flujo y diagramas de base de datos con exportación a SQL.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
ng serve
```

Abre http://localhost:4200 en tu navegador.

## Características

### 🎨 Editor de Diagramas
- **Añadir formas:** arrastra una forma desde el panel izquierdo ("Flujo" o "Base de datos") al lienzo
- **Mover formas:** haz clic en una forma y arrástrala
- **Editar:** selecciona una forma y usa el panel derecho para cambiar texto/colores, o **Editar tabla** si es una tabla
- **Zoom:** usa los botones + y − en la barra superior

### 📋 Sistema de Plantillas (NUEVO)
- **Plantillas predefinidas:** accede a plantillas de diagramas de flujo y bases de datos comunes
- **Categorías:**
  - 📊 Diagramas de flujo: flujo básico, flujo con decisiones
  - 🗄️ Base de datos: sistema de usuarios, e-commerce básico
  - ⭐ Mis plantillas: guarda tus propios diagramas como plantillas reutilizables
- **Crear plantillas personalizadas:** guarda cualquier diagrama como plantilla para uso futuro
- **Acceso rápido:** botón 📋 en la barra de herramientas

### 💾 Gestión de Archivos
- **Guardar:** guarda el diagrama en JSON o en la galería personal
- **Abrir:** carga un archivo `.json` guardado antes
- **Galería:** accede a todos tus diagramas guardados desde la vista de galería

### 🗄️ Base de Datos
- **Exportar SQL:** genera el código SQL para crear la base de datos (CREATE TABLE y FOREIGN KEY)
- **Importar SQL:** carga archivos `.sql` y genera automáticamente el diagrama de tablas
- **Editor de tablas:** define columnas, tipos de datos, claves primarias y foráneas

## Uso Rápido

1. **Crear desde plantilla:** Haz clic en 📋 y selecciona una plantilla
2. **Crear desde cero:** Arrastra formas desde el panel izquierdo
3. **Guardar:** Usa 📁 para guardar en la galería o descarga como JSON
4. **Exportar SQL:** Haz clic en el botón SQL para generar el código
