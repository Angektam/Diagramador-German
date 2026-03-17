import { Injectable } from '@angular/core';
import { ProjectInfo, ProjectType } from '../models/project-info.interface';
import { GeneratedPrompt } from '../models/prompt-template.interface';

@Injectable({ providedIn: 'root' })
export class PromptGeneratorService {

  generatePrompt(projectInfo: ProjectInfo, documents: string[]): GeneratedPrompt {
    const rawDocs = documents.join('\n\n---\n\n');
    const content = this.buildFullPrompt(projectInfo, rawDocs);

    return {
      content,
      metadata: {
        projectType: projectInfo.type,
        generatedAt: new Date(),
        documentCount: documents.length,
        wordCount: content.split(/\s+/).length
      }
    };
  }

  private buildFullPrompt(info: ProjectInfo, rawDocs: string): string {
    const stack = this.getStack(info);
    const folderTree = info.architecture?.folderStructure ?? this.getDefaultFolderTree(info.type);
    const fileList = this.getFileList(info);
    const reqList = this.buildRequirementsList(info);
    const featureList = this.buildFeaturesList(info);
    const techList = info.technologies.length > 0
      ? info.technologies.join(', ')
      : stack.join(', ');

    return `Eres un experto desarrollador de software. Tu tarea es generar el código fuente COMPLETO y FUNCIONAL de un proyecto de software basándote en la documentación proporcionada.

════════════════════════════════════════════════════════════
DOCUMENTACIÓN DEL PROYECTO
════════════════════════════════════════════════════════════

${rawDocs.length > 12000 ? rawDocs.substring(0, 12000) + '\n\n[... documentación adicional truncada por longitud ...]' : rawDocs}

════════════════════════════════════════════════════════════
ANÁLISIS EXTRAÍDO
════════════════════════════════════════════════════════════

Nombre del proyecto: ${info.name}
Tipo: ${this.getTypeLabel(info.type)}
Stack tecnológico: ${techList}

REQUISITOS IDENTIFICADOS:
${reqList}

FUNCIONALIDADES:
${featureList}

════════════════════════════════════════════════════════════
INSTRUCCIONES DE GENERACIÓN
════════════════════════════════════════════════════════════

Genera el proyecto completo siguiendo EXACTAMENTE este formato para cada archivo:

### ARCHIVO: <ruta/del/archivo>
\`\`\`<lenguaje>
<contenido completo del archivo>
\`\`\`

REGLAS OBLIGATORIAS:
1. Genera TODOS los archivos necesarios, sin omitir ninguno
2. Cada archivo debe tener código COMPLETO y FUNCIONAL, no esqueletos ni placeholders
3. Incluye comentarios explicativos en la lógica compleja
4. Implementa manejo de errores en todos los puntos críticos
5. Valida todas las entradas de usuario
6. Sigue los principios SOLID y clean code
7. El proyecto debe poder ejecutarse con los comandos de inicio sin modificaciones

════════════════════════════════════════════════════════════
ESTRUCTURA DE ARCHIVOS A GENERAR
════════════════════════════════════════════════════════════

\`\`\`
${folderTree}
\`\`\`

Archivos requeridos:
${fileList}

════════════════════════════════════════════════════════════
ESPECIFICACIONES TÉCNICAS
════════════════════════════════════════════════════════════

${this.buildTechSpecs(info)}

════════════════════════════════════════════════════════════
ARCHIVOS DE CONFIGURACIÓN REQUERIDOS
════════════════════════════════════════════════════════════

${this.buildConfigFiles(info)}

════════════════════════════════════════════════════════════
ORDEN DE GENERACIÓN
════════════════════════════════════════════════════════════

Genera los archivos en este orden:
1. package.json / pom.xml / requirements.txt (dependencias)
2. Archivos de configuración (tsconfig, .env.example, etc.)
3. Modelos e interfaces / entidades
4. Servicios / repositorios / casos de uso
5. Controladores / componentes de UI
6. Rutas / navegación
7. Punto de entrada principal (main, index, app)
8. README.md con instrucciones completas

════════════════════════════════════════════════════════════
RESULTADO ESPERADO
════════════════════════════════════════════════════════════

Al finalizar, el proyecto debe:
- Compilar sin errores
- Ejecutarse con un solo comando (npm start / python manage.py runserver / etc.)
- Implementar TODAS las funcionalidades listadas
- Tener una UI funcional y usable (si aplica)
- Incluir datos de ejemplo / seed data para demostración

COMIENZA AHORA con el archivo package.json o equivalente.`;
  }

  private buildRequirementsList(info: ProjectInfo): string {
    if (info.requirements.length === 0) return '- (Extraer de la documentación proporcionada)';
    return info.requirements
      .map(r => `- [${r.type === 'functional' ? 'F' : 'NF'}] ${r.description}`)
      .join('\n');
  }

  private buildFeaturesList(info: ProjectInfo): string {
    if (info.features.length === 0) return '- (Extraer de la documentación proporcionada)';
    return info.features
      .map(f => `- ${f.description}`)
      .join('\n');
  }

  private buildTechSpecs(info: ProjectInfo): string {
    const specs: Record<ProjectType, string> = {
      'web-app': `- Framework: React 18+ con TypeScript o Angular 17+ standalone
- Estado: Context API / Signals / Zustand
- Estilos: CSS Modules o Tailwind CSS
- HTTP: Axios o fetch nativo
- Routing: React Router v6 o Angular Router
- Formularios: React Hook Form o Angular Reactive Forms
- Validación: Zod o class-validator`,

      'api': `- Runtime: Node.js 20+ con TypeScript
- Framework: Express.js o Fastify o NestJS
- ORM: Prisma o TypeORM
- Base de datos: PostgreSQL (esquema SQL incluido)
- Autenticación: JWT con refresh tokens
- Validación: Zod o class-validator
- Documentación: Swagger/OpenAPI automático
- Variables de entorno: dotenv con .env.example`,

      'mobile-app': `- Framework: React Native con Expo o Flutter
- Navegación: React Navigation v6 o Go Router
- Estado: Zustand o Riverpod
- HTTP: Axios o Dio
- Almacenamiento local: AsyncStorage o Hive
- Autenticación: JWT almacenado en SecureStore`,

      'microservices': `- Runtime: Node.js con TypeScript por servicio
- Comunicación: REST + Message Queue (Bull/RabbitMQ)
- Base de datos: Una por servicio (PostgreSQL/MongoDB)
- API Gateway: Express con http-proxy-middleware
- Docker: Dockerfile por servicio + docker-compose.yml
- Variables de entorno: .env por servicio`,

      'desktop-app': `- Framework: Electron con React/Vue + TypeScript
- IPC: Electron IPC para comunicación main/renderer
- Almacenamiento: SQLite con better-sqlite3
- Empaquetado: electron-builder`,

      'cms': `- Framework: Next.js 14+ con App Router
- CMS: Payload CMS o Strapi
- Base de datos: PostgreSQL
- Autenticación: NextAuth.js
- Imágenes: Next/Image con optimización`,

      'ecommerce': `- Frontend: Next.js 14+ con TypeScript
- Backend: Node.js + Express API
- Base de datos: PostgreSQL con Prisma
- Pagos: Stripe SDK
- Autenticación: JWT + sesiones
- Carrito: Estado persistente en localStorage + DB`,

      'dashboard': `- Framework: React 18+ o Vue 3 con TypeScript
- Gráficas: Recharts o Chart.js
- Tablas: TanStack Table
- Estado: Zustand o Pinia
- HTTP: React Query o Vue Query para caché`,

      'other': `- Usar el stack más apropiado según la documentación
- TypeScript obligatorio
- Tests unitarios con Jest o Vitest
- Linting con ESLint + Prettier`
    };

    return specs[info.type] ?? specs['other'];
  }

  private buildConfigFiles(info: ProjectInfo): string {
    const configs: Record<ProjectType, string> = {
      'web-app': `- package.json con todas las dependencias
- tsconfig.json
- .env.example con variables necesarias
- README.md con: instalación, scripts, estructura`,

      'api': `- package.json con scripts: dev, build, start, migrate
- tsconfig.json
- .env.example: DATABASE_URL, JWT_SECRET, PORT
- prisma/schema.prisma o migrations SQL
- README.md con endpoints documentados`,

      'mobile-app': `- package.json o pubspec.yaml
- app.json (Expo) o AndroidManifest.xml
- .env.example con API_URL
- README.md con instrucciones de emulador`,

      'microservices': `- docker-compose.yml con todos los servicios
- package.json por servicio
- .env.example por servicio
- README.md con arquitectura y comandos`,

      'desktop-app': `- package.json con electron-builder config
- tsconfig.json
- README.md con build instructions`,

      'cms': `- package.json
- next.config.js
- .env.example: DATABASE_URL, NEXTAUTH_SECRET
- README.md`,

      'ecommerce': `- package.json (frontend y backend)
- .env.example: DATABASE_URL, STRIPE_KEY, JWT_SECRET
- prisma/schema.prisma
- README.md con setup completo`,

      'dashboard': `- package.json
- tsconfig.json
- .env.example con API endpoints
- README.md`,

      'other': `- package.json o equivalente
- Archivo de configuración del entorno
- README.md completo`
    };

    return configs[info.type] ?? configs['other'];
  }

  private getFileList(info: ProjectInfo): string {
    const lists: Record<ProjectType, string> = {
      'web-app': `- src/main.tsx o src/main.ts
- src/App.tsx o src/app.component.ts
- src/components/ (un archivo por componente)
- src/services/api.service.ts
- src/hooks/ o src/services/
- src/models/ o src/types/
- src/routes/ o src/app.routes.ts
- src/styles/ o styles.css
- public/index.html
- package.json, tsconfig.json, README.md`,

      'api': `- src/index.ts (punto de entrada)
- src/app.ts (configuración Express/Fastify)
- src/routes/ (un archivo por recurso)
- src/controllers/ (un archivo por recurso)
- src/services/ (lógica de negocio)
- src/repositories/ (acceso a datos)
- src/models/ o src/entities/
- src/middleware/ (auth, validation, errors)
- src/config/ (database, env)
- prisma/schema.prisma o migrations/
- package.json, tsconfig.json, .env.example, README.md`,

      'mobile-app': `- App.tsx o lib/main.dart
- src/screens/ o lib/screens/
- src/components/ o lib/widgets/
- src/navigation/ o lib/routes/
- src/services/ o lib/services/
- src/models/ o lib/models/
- package.json o pubspec.yaml, README.md`,

      'microservices': `Por cada servicio:
- src/index.ts
- src/routes/, src/controllers/, src/services/
- Dockerfile
- package.json, .env.example
Raíz:
- docker-compose.yml
- README.md`,

      'desktop-app': `- src/main/index.ts (proceso principal)
- src/renderer/App.tsx (UI)
- src/renderer/components/
- src/renderer/services/
- src/preload/index.ts
- package.json, tsconfig.json, README.md`,

      'cms': `- app/ (Next.js App Router)
- app/api/ (API routes)
- components/
- lib/ (utilidades)
- prisma/schema.prisma
- package.json, next.config.js, README.md`,

      'ecommerce': `Frontend: pages/ o app/, components/, hooks/, services/
Backend: src/routes/, src/controllers/, src/models/
Compartido: types/, utils/
Config: package.json x2, prisma/schema.prisma, README.md`,

      'dashboard': `- src/App.tsx
- src/pages/ (una por sección)
- src/components/charts/
- src/components/tables/
- src/services/
- src/types/
- package.json, tsconfig.json, README.md`,

      'other': `- Punto de entrada principal
- Módulos por funcionalidad
- Modelos/tipos
- Servicios/utilidades
- Configuración
- README.md`
    };

    return lists[info.type] ?? lists['other'];
  }

  private getDefaultFolderTree(type: ProjectType): string {
    const trees: Record<ProjectType, string> = {
      'web-app':
`proyecto/
├── src/
│   ├── components/
│   ├── services/
│   ├── models/
│   ├── routes/
│   └── styles/
├── public/
├── package.json
├── tsconfig.json
└── README.md`,

      'api':
`proyecto/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middleware/
│   └── config/
├── prisma/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md`,

      'mobile-app':
`proyecto/
├── src/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── services/
│   └── models/
├── assets/
├── package.json
└── README.md`,

      'microservices':
`proyecto/
├── services/
│   ├── user-service/
│   ├── product-service/
│   └── api-gateway/
├── docker-compose.yml
└── README.md`,

      'desktop-app':
`proyecto/
├── src/
│   ├── main/
│   ├── renderer/
│   └── preload/
├── package.json
└── README.md`,

      'cms':
`proyecto/
├── app/
├── components/
├── lib/
├── prisma/
├── package.json
└── README.md`,

      'ecommerce':
`proyecto/
├── frontend/
├── backend/
├── shared/
└── README.md`,

      'dashboard':
`proyecto/
├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── types/
├── package.json
└── README.md`,

      'other':
`proyecto/
├── src/
├── package.json
└── README.md`
    };

    return trees[type] ?? trees['other'];
  }

  private getStack(info: ProjectInfo): string[] {
    const stacks: Record<ProjectType, string[]> = {
      'web-app': ['React 18', 'TypeScript', 'Vite', 'CSS Modules'],
      'api': ['Node.js', 'Express', 'TypeScript', 'Prisma', 'PostgreSQL'],
      'mobile-app': ['React Native', 'Expo', 'TypeScript'],
      'microservices': ['Node.js', 'TypeScript', 'Docker', 'PostgreSQL'],
      'desktop-app': ['Electron', 'React', 'TypeScript'],
      'cms': ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
      'ecommerce': ['Next.js', 'Node.js', 'TypeScript', 'Prisma', 'Stripe'],
      'dashboard': ['React', 'TypeScript', 'Recharts', 'TanStack Table'],
      'other': ['TypeScript', 'Node.js']
    };
    return stacks[info.type] ?? stacks['other'];
  }

  private getTypeLabel(type: ProjectType): string {
    const labels: Record<ProjectType, string> = {
      'web-app': 'Aplicación Web',
      'api': 'API REST',
      'mobile-app': 'Aplicación Móvil',
      'desktop-app': 'Aplicación de Escritorio',
      'microservices': 'Microservicios',
      'cms': 'CMS',
      'ecommerce': 'E-commerce',
      'dashboard': 'Dashboard',
      'other': 'Aplicación'
    };
    return labels[type] ?? 'Aplicación';
  }
}
