import { Injectable } from '@angular/core';
import { ProjectInfo, ProjectType } from '../models/project-info.interface';
import { GeneratedPrompt, PromptTargetModel } from '../models/prompt-template.interface';

@Injectable({ providedIn: 'root' })
export class PromptGeneratorService {

  generatePrompt(
    projectInfo: ProjectInfo,
    documents: string[],
    lang: 'es' | 'en' = 'es',
    targetModel: PromptTargetModel = 'auto',
    tokenBudget = 1200
  ): GeneratedPrompt {
    const safeBudget = Math.max(600, Math.min(8000, tokenBudget));
    const normalizedInfo = this.normalizeInfo(projectInfo, safeBudget);
    const rawDocs = documents.join('\n\n---\n\n');
    const resolvedModel = this.resolveModel(targetModel, rawDocs.length);
    const limitedDocs = this.limitDocsForModel(rawDocs, resolvedModel, safeBudget);
    const content = lang === 'en'
      ? this.buildFullPromptEn(normalizedInfo, limitedDocs, resolvedModel)
      : this.buildFullPrompt(normalizedInfo, limitedDocs, resolvedModel);

    return {
      content,
      metadata: {
        projectType: normalizedInfo.type,
        generatedAt: new Date(),
        documentCount: documents.length,
        wordCount: content.split(/\s+/).length,
        targetModel: resolvedModel,
        targetTokenBudget: safeBudget
      }
    };
  }

  generateShortPrompt(projectInfo: ProjectInfo, lang: 'es' | 'en' = 'es'): GeneratedPrompt {
    const content = lang === 'en' ? this.buildShortPromptEn(projectInfo) : this.buildShortPrompt(projectInfo);
    return {
      content,
      metadata: { projectType: projectInfo.type, generatedAt: new Date(), documentCount: 0, wordCount: content.split(/\s+/).length }
    };
  }

  private buildShortPrompt(info: ProjectInfo): string {
    const stack = this.getStack(info);
    const techList = info.technologies.length > 0 ? info.technologies.join(', ') : stack.join(', ');
    const reqs = info.requirements.slice(0, 10).map(r => `- ${r.description}`).join('\n') || '- (ver documentación)';
    return `Eres un experto desarrollador. Genera el código COMPLETO y FUNCIONAL del siguiente proyecto:

Nombre: ${info.name}
Tipo: ${this.getTypeLabel(info.type)}
Stack: ${techList}

REQUISITOS PRINCIPALES:
${reqs}

INSTRUCCIONES:
- Genera TODOS los archivos necesarios con código completo (sin placeholders)
- Sigue principios SOLID y clean code
- Incluye package.json, configuración y README.md
- El proyecto debe ejecutarse con un solo comando

Comienza con package.json o equivalente.`;
  }

  private buildShortPromptEn(info: ProjectInfo): string {
    const stack = this.getStack(info);
    const techList = info.technologies.length > 0 ? info.technologies.join(', ') : stack.join(', ');
    const reqs = info.requirements.slice(0, 10).map(r => `- ${r.description}`).join('\n') || '- (see documentation)';
    return `You are an expert developer. Generate COMPLETE and FUNCTIONAL code for the following project:

Name: ${info.name}
Type: ${this.getTypeLabel(info.type)}
Stack: ${techList}

MAIN REQUIREMENTS:
${reqs}

INSTRUCTIONS:
- Generate ALL necessary files with complete code (no placeholders)
- Follow SOLID principles and clean code
- Include package.json, config files and README.md
- Project must run with a single command

Start with package.json or equivalent.`;
  }

  private buildFullPromptEn(info: ProjectInfo, rawDocs: string, model: Exclude<PromptTargetModel, 'auto'>): string {
    const stack = this.getStack(info);
    const folderTree = info.architecture?.folderStructure ?? this.getDefaultFolderTree(info.type);
    const fileList = this.getFileList(info);
    const reqList = this.buildRequirementsListEn(info);
    const featureList = this.buildFeaturesListEn(info);
    const techList = info.technologies.length > 0 ? info.technologies.join(', ') : stack.join(', ');

    return `You are an expert software developer. Your task is to generate COMPLETE and FUNCTIONAL source code for a software project based on the provided documentation.

MODEL TARGET: ${this.modelLabel(model)}
${this.buildModelGuidance(model, 'en')}

════════════════════════════════════════════════════════════
PROJECT DOCUMENTATION
════════════════════════════════════════════════════════════

${rawDocs}

════════════════════════════════════════════════════════════
EXTRACTED ANALYSIS
════════════════════════════════════════════════════════════

Project name: ${info.name}
Type: ${this.getTypeLabel(info.type)}
Tech stack: ${techList}

IDENTIFIED REQUIREMENTS:
${reqList}

FEATURES:
${featureList}

════════════════════════════════════════════════════════════
GENERATION INSTRUCTIONS
════════════════════════════════════════════════════════════

Generate the complete project following EXACTLY this format for each file:

### FILE: <path/to/file>
\`\`\`<language>
<complete file content>
\`\`\`

MANDATORY RULES:
1. Generate ALL necessary files, without omitting any
2. Each file must have COMPLETE and FUNCTIONAL code, no skeletons or placeholders
3. Include explanatory comments in complex logic
4. Implement error handling at all critical points
5. Validate all user inputs
6. Follow SOLID principles and clean code
7. The project must run with startup commands without modifications

════════════════════════════════════════════════════════════
FILE STRUCTURE TO GENERATE
════════════════════════════════════════════════════════════

\`\`\`
${folderTree}
\`\`\`

Required files:
${fileList}

════════════════════════════════════════════════════════════
TECHNICAL SPECIFICATIONS
════════════════════════════════════════════════════════════

${this.buildTechSpecs(info)}

════════════════════════════════════════════════════════════
REQUIRED CONFIGURATION FILES
════════════════════════════════════════════════════════════

${this.buildConfigFiles(info)}

════════════════════════════════════════════════════════════
GENERATION ORDER
════════════════════════════════════════════════════════════

Generate files in this order:
1. package.json / pom.xml / requirements.txt (dependencies)
2. Configuration files (tsconfig, .env.example, etc.)
3. Models, interfaces / entities
4. Services / repositories / use cases
5. Controllers / UI components
6. Routes / navigation
7. Main entry point (main, index, app)
8. README.md with complete instructions

════════════════════════════════════════════════════════════
EXPECTED RESULT
════════════════════════════════════════════════════════════

When finished, the project must:
- Compile without errors
- Run with a single command (npm start / python manage.py runserver / etc.)
- Implement ALL listed features
- Have a functional and usable UI (if applicable)
- Include sample / seed data for demonstration

START NOW with the package.json or equivalent file.`;
  }

  private buildRequirementsListEn(info: ProjectInfo): string {
    if (info.requirements.length === 0) return '- (Extract from provided documentation)';
    return info.requirements
      .map(r => `- [${r.type === 'functional' ? 'F' : 'NF'}] ${r.description}`)
      .join('\n');
  }

  private buildFeaturesListEn(info: ProjectInfo): string {
    if (info.features.length === 0) return '- (Extract from provided documentation)';
    return info.features.map(f => `- ${f.description}`).join('\n');
  }

  private buildFullPrompt(info: ProjectInfo, rawDocs: string, model: Exclude<PromptTargetModel, 'auto'>): string {
    const stack = this.getStack(info);
    const folderTree = info.architecture?.folderStructure ?? this.getDefaultFolderTree(info.type);
    const fileList = this.getFileList(info);
    const reqList = this.buildRequirementsList(info);
    const featureList = this.buildFeaturesList(info);
    const techList = info.technologies.length > 0
      ? info.technologies.join(', ')
      : stack.join(', ');

    return `Eres un experto desarrollador de software. Tu tarea es generar el código fuente COMPLETO y FUNCIONAL de un proyecto de software basándote en la documentación proporcionada.

MODELO OBJETIVO: ${this.modelLabel(model)}
${this.buildModelGuidance(model, 'es')}

════════════════════════════════════════════════════════════
DOCUMENTACIÓN DEL PROYECTO
════════════════════════════════════════════════════════════

${rawDocs}

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

  private resolveModel(model: PromptTargetModel, docsLength: number): Exclude<PromptTargetModel, 'auto'> {
    if (model !== 'auto') return model;
    if (docsLength > 18000) return 'claude';
    if (docsLength > 12000) return 'gemini';
    return 'gpt';
  }

  private modelDocLimit(model: Exclude<PromptTargetModel, 'auto'>): number {
    if (model === 'claude') return 22000;
    if (model === 'gemini') return 16000;
    return 12000;
  }

  private limitDocsForModel(rawDocs: string, model: Exclude<PromptTargetModel, 'auto'>, tokenBudget: number): string {
    const budgetChars = Math.round(tokenBudget * 3.6);
    const limit = Math.min(this.modelDocLimit(model), budgetChars);
    if (rawDocs.length <= limit) return rawDocs;
    return `${rawDocs.substring(0, limit)}\n\n[... documentación truncada automáticamente para ${this.modelLabel(model)} ...]`;
  }

  private normalizeInfo(info: ProjectInfo, tokenBudget: number): ProjectInfo {
    const seenReq = new Set<string>();
    const normalizedReqs = info.requirements.filter(r => {
      const key = r.description.toLowerCase().trim().replace(/\s+/g, ' ').slice(0, 120);
      if (seenReq.has(key)) return false;
      seenReq.add(key);
      return true;
    });

    const seenFeat = new Set<string>();
    const normalizedFeatures = info.features.filter(f => {
      const key = f.description.toLowerCase().trim().replace(/\s+/g, ' ').slice(0, 120);
      if (seenFeat.has(key)) return false;
      seenFeat.add(key);
      return true;
    });

    const maxReqs = Math.max(6, Math.min(25, Math.floor(tokenBudget / 120)));
    const maxFeatures = Math.max(4, Math.min(15, Math.floor(tokenBudget / 200)));

    return {
      ...info,
      requirements: normalizedReqs.slice(0, maxReqs),
      features: normalizedFeatures.slice(0, maxFeatures)
    };
  }

  private modelLabel(model: Exclude<PromptTargetModel, 'auto'>): string {
    if (model === 'gpt') return 'GPT';
    if (model === 'claude') return 'Claude';
    return 'Gemini';
  }

  private buildModelGuidance(model: Exclude<PromptTargetModel, 'auto'>, lang: 'es' | 'en'): string {
    const mapEs: Record<Exclude<PromptTargetModel, 'auto'>, string> = {
      gpt: 'Optimiza para respuestas claras, formato estricto por archivo y bloques de código compactos.',
      claude: 'Aprovecha contexto largo, explicaciones concisas por bloque y trazabilidad de requisitos.',
      gemini: 'Prioriza estructura modular, pasos de implementación y consistencia entre frontend/backend.'
    };
    const mapEn: Record<Exclude<PromptTargetModel, 'auto'>, string> = {
      gpt: 'Optimize for concise output, strict file-by-file formatting and compact code blocks.',
      claude: 'Leverage long context, brief rationale per block and requirement traceability.',
      gemini: 'Prioritize modular structure, implementation steps and frontend/backend consistency.'
    };
    return lang === 'en' ? mapEn[model] : mapEs[model];
  }
}
