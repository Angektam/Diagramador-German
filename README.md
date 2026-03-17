# 📄 Generador de Prompts para IA

Aplicación web para generar prompts optimizados para IA de generación de código a partir de documentación de proyectos.

## 🎯 ¿Qué hace?

Sube tu documentación (PDFs, Word, Markdown, TXT) y el sistema:
1. Analiza el contenido
2. Detecta el tipo de proyecto
3. Extrae requisitos y funcionalidades
4. Genera un prompt estructurado y optimizado
5. Listo para copiar y usar en ChatGPT, Claude, Copilot, etc.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm start
```

Abre http://localhost:4200

### Login

Usa las credenciales demo:
- Usuario: `demo` / Contraseña: `demo`
- Admin: `admin` / Contraseña: `admin123`

## 📋 Flujo de Uso

1. **Login** - Accede con tus credenciales
2. **Sube documentos** - Arrastra o selecciona archivos (PDF, DOC, MD, TXT)
3. **Analiza** - El sistema procesa la documentación
4. **Revisa** - Ve el análisis del proyecto detectado
5. **Genera** - Crea el prompt optimizado
6. **Copia** - Usa el prompt en tu IA favorita

## 🛠️ Tecnologías

- Angular 18 (Standalone Components)
- TypeScript 5.x
- Signals para reactividad
- CSS moderno

## 📁 Estructura

```
src/
├── app/
│   ├── components/
│   │   ├── login/                    # Autenticación
│   │   └── prompt-generator/         # Generador principal
│   ├── services/
│   │   ├── document-analyzer.service.ts    # Análisis de docs
│   │   ├── prompt-generator.service.ts     # Generación de prompts
│   │   ├── auth.service.ts                 # Autenticación
│   │   └── notification.service.ts         # Notificaciones
│   └── models/
│       ├── project-info.interface.ts       # Info del proyecto
│       └── prompt-template.interface.ts    # Templates
```

## ✨ Características

- 📁 Carga múltiple de archivos (drag & drop)
- 🔍 Análisis inteligente de documentación
- 🎯 Detección automática de tipo de proyecto
- 🛠️ Identificación de tecnologías
- 📋 Extracción de requisitos
- 🏗️ Sugerencias de arquitectura
- 📝 Generación de prompts estructurados
- 📋 Copiar al portapapeles
- 💾 Descargar como archivo

## 🎨 Tipos de Proyecto Detectables

- Aplicaciones Web (SPA, MPA)
- APIs REST/GraphQL
- Aplicaciones Móviles
- Aplicaciones de Escritorio
- Microservicios
- CMS
- E-commerce
- Dashboards

## 📝 Formato del Prompt Generado

El prompt incluye:
- Contexto del proyecto
- Requisitos funcionales y no funcionales
- Stack tecnológico
- Arquitectura sugerida
- Estructura de carpetas
- Componentes principales
- Guía de implementación
- Checklist completo

## 🔧 Comandos

```bash
# Desarrollo
npm start

# Build producción
npm run build

# Generar prompt desde CLI (script legacy)
npm run generate-prompt
```

## 📄 Licencia

Código abierto

---

**Nota**: Este proyecto fue transformado desde un diagramador SQL a un generador de prompts para IA.
