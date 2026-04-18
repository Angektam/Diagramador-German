import { Injectable } from '@angular/core';
import { ProjectInfo, ProjectType, Requirement, Feature } from '../models/project-info.interface';

export interface AnalysisResult extends ProjectInfo {
  summary: string;
  confidence: { score: number; level: 'high' | 'medium' | 'low'; detail: string };
  stackSuggestions: StackSuggestion[];
}

export interface StackSuggestion {
  name: string;
  techs: string[];
  description: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentAnalyzerService {

  analyzeDocuments(documents: string[]): AnalysisResult {
    const combined = documents.join('\n\n');
    const type = this.detectProjectType(combined);
    const { score, detail } = this.computeConfidence(combined, type);
    return {
      name: this.extractProjectName(combined),
      description: this.extractDescription(combined),
      summary: this.generateSummary(combined, type),
      type,
      technologies: this.detectTechnologies(combined),
      requirements: this.extractRequirements(combined),
      features: this.extractFeatures(combined),
      architecture: this.suggestArchitecture(type),
      confidence: { score, level: score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low', detail },
      stackSuggestions: this.getStackSuggestions(type)
    };
  }

  private extractProjectName(text: string): string {
    const patterns = [
      /^#\s+(.+)$/m,
      /(?:proyecto|sistema|aplicación|app|plataforma|nombre)\s*[:\-]\s*([^\n.]{5,60})/i,
      /(?:desarrollar|crear|construir)\s+(?:un[ao]?\s+)?([^\n.]{5,60})/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) {
        const c = m[1].trim();
        if (c.length >= 5 && /^[\w\s\-áéíóúÁÉÍÓÚñÑ:,().]+$/.test(c)) return c;
      }
    }
    const first = text.split('\n').map(l => l.trim())
      .find(l => l.length > 5 && l.length < 80 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(l));
    return first ?? 'Mi Proyecto';
  }

  private extractDescription(text: string): string {
    const sentences = text.split(/[.!?]\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 30 && s.length < 300 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(s));
    return sentences.slice(0, 2).join('. ') + (sentences.length > 0 ? '.' : '');
  }

  private detectProjectType(text: string): ProjectType {
    const lower = text.toLowerCase();
    const checks: [ProjectType, string[]][] = [
      ['ecommerce',     ['tienda', 'e-commerce', 'carrito', 'compra', 'venta online', 'shop', 'checkout', 'pago', 'producto', 'inventario', 'pedido']],
      ['dashboard',     ['dashboard', 'panel de control', 'analytics', 'métricas', 'reportes', 'gráficas', 'estadísticas', 'kpi', 'indicador']],
      ['api',           ['api', 'rest', 'graphql', 'endpoint', 'backend', 'servidor', 'microservicio', 'swagger', 'openapi']],
      ['mobile-app',    ['móvil', 'mobile', 'android', 'ios', 'react native', 'flutter', 'app móvil', 'smartphone', 'tablet']],
      ['desktop-app',   ['escritorio', 'desktop', 'electron', 'aplicación de escritorio', 'windows app', 'macos app']],
      ['microservices', ['microservicio', 'microservice', 'arquitectura distribuida', 'contenedor', 'docker', 'kubernetes', 'k8s']],
      ['cms',           ['cms', 'gestor de contenido', 'blog', 'wordpress', 'publicaciones', 'artículo', 'editorial']],
      ['web-app',       ['aplicación web', 'web app', 'spa', 'frontend', 'react', 'angular', 'vue', 'página web', 'sitio web', 'portal']],
    ];
    let bestType: ProjectType = 'other';
    let bestScore = 0;
    for (const [type, keywords] of checks) {
      const score = keywords.filter(k => lower.includes(k)).length;
      if (score > bestScore) { bestScore = score; bestType = type; }
    }
    return bestType;
  }

  detectLanguage(text: string): 'en' | 'es' {
    const enWords = ['the', 'and', 'for', 'with', 'this', 'that', 'should', 'must', 'will', 'system', 'user', 'application', 'feature', 'requirement'];
    const esWords = ['el', 'la', 'los', 'las', 'para', 'con', 'que', 'debe', 'sistema', 'usuario', 'aplicación', 'funcionalidad', 'requisito'];
    const lower = text.toLowerCase();
    const enScore = enWords.filter(w => lower.includes(` ${w} `)).length;
    const esScore = esWords.filter(w => lower.includes(` ${w} `)).length;
    return enScore > esScore ? 'en' : 'es';
  }

  private detectTechnologies(text: string): string[] {
    const techs = new Set<string>();
    const map: [string, RegExp][] = [
      ['React',       /\breact\b/i],
      ['Angular',     /\bangular\b/i],
      ['Vue',         /\bvue\.?js\b/i],
      ['Next.js',     /\bnext\.?js\b/i],
      ['Node.js',     /\bnode\.?js\b/i],
      ['Express',     /\bexpress\b/i],
      ['NestJS',      /\bnest\.?js\b/i],
      ['TypeScript',  /\btypescript\b/i],
      ['JavaScript',  /\bjavascript\b/i],
      ['Python',      /\bpython\b/i],
      ['Django',      /\bdjango\b/i],
      ['FastAPI',     /\bfastapi\b/i],
      ['Java',        /\bjava\b/i],
      ['Spring',      /\bspring\b/i],
      ['PostgreSQL',  /\bpostgres(ql)?\b/i],
      ['MySQL',       /\bmysql\b/i],
      ['MongoDB',     /\bmongodb?\b/i],
      ['Redis',       /\bredis\b/i],
      ['Docker',      /\bdocker\b/i],
      ['Kubernetes',  /\bkubernetes\b|k8s/i],
      ['GraphQL',     /\bgraphql\b/i],
      ['Prisma',      /\bprisma\b/i],
      ['Tailwind',    /\btailwind\b/i],
      ['Flutter',     /\bflutter\b/i],
      ['Stripe',      /\bstripe\b/i],
    ];
    for (const [name, re] of map) {
      if (re.test(text)) techs.add(name);
    }
    return Array.from(techs);
  }

  private extractRequirements(text: string): Requirement[] {
    const reqs: Requirement[] = [];
    const seen = new Set<string>();
    let id = 1;
    const patterns = [
      /(?:debe(?:rá)?|should|necesita|requiere|tiene que|es necesario que)\s+(.{15,150})/gi,
      /^[\s]*(?:\d+\.|[-*•])\s+(.{15,150})/gm,
      /(?:funcionalidad|módulo|característica|feature)\s*[:\-]\s*(.{10,120})/gi,
      /(?:el sistema|la aplicación|la plataforma|el usuario)\s+(?:debe|podrá|permitirá|tendrá)\s+(.{10,120})/gi,
    ];
    for (const pattern of patterns) {
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        const desc = m[1].trim().replace(/[.;,]+$/, '');
        const key = desc.toLowerCase().slice(0, 40);
        if (desc.length > 10 && !seen.has(key)) {
          seen.add(key);
          reqs.push({ id: `REQ-${id++}`, type: this.classifyReq(desc), description: desc, priority: this.priorityOf(desc) });
        }
      }
    }
    return reqs.slice(0, 25);
  }

  private classifyReq(text: string): 'functional' | 'non-functional' {
    const nfKw = ['rendimiento', 'performance', 'seguridad', 'security', 'escalab', 'disponib', 'usabilidad', 'mantenib', 'velocidad', 'tiempo de respuesta'];
    return nfKw.some(k => text.toLowerCase().includes(k)) ? 'non-functional' : 'functional';
  }

  private priorityOf(text: string): 'high' | 'medium' | 'low' {
    const lower = text.toLowerCase();
    if (/crítico|esencial|obligatorio|imprescindible|alta prioridad/.test(lower)) return 'high';
    if (/opcional|deseable|nice to have|baja prioridad/.test(lower)) return 'low';
    return 'medium';
  }

  private extractFeatures(text: string): Feature[] {
    const features: Feature[] = [];
    const seen = new Set<string>();
    const patterns = [
      /(?:funcionalidad|feature|módulo|sección)\s*[:\-]\s*([^\n.]{10,100})/gi,
      /(?:el sistema|la app|la aplicación)\s+(?:debe|deberá|permitirá|tendrá que)\s+([^\n.]{10,100})/gi,
      /(?:gestión|administración|control|registro|búsqueda|generación|visualización)\s+(?:de\s+)?([^\n.,]{5,60})/gi,
    ];
    let i = 1;
    for (const p of patterns) {
      let m: RegExpExecArray | null;
      while ((m = p.exec(text)) !== null) {
        const desc = m[1].trim();
        const key = desc.toLowerCase().slice(0, 30);
        if (desc.length > 8 && !seen.has(key)) {
          seen.add(key);
          features.push({ name: `Feature ${i++}`, description: desc, components: [] });
        }
      }
    }
    return features.slice(0, 15);
  }

  private suggestArchitecture(type: ProjectType): any {
    const map: Record<ProjectType, any> = {
      'web-app':       { pattern: 'Component-Service', layers: ['Presentation', 'Business Logic', 'Data Access'], components: [], folderStructure: 'src/\n├── components/\n├── services/\n├── models/\n└── routes/' },
      'api':           { pattern: 'Layered Architecture', layers: ['Controllers', 'Services', 'Repositories', 'Models'], components: [], folderStructure: 'src/\n├── controllers/\n├── services/\n├── repositories/\n└── models/' },
      'mobile-app':    { pattern: 'MVVM', layers: ['View', 'ViewModel', 'Model'], components: [], folderStructure: 'src/\n├── screens/\n├── viewmodels/\n├── services/\n└── models/' },
      'microservices': { pattern: 'Microservices', layers: ['API Gateway', 'Services', 'Databases'], components: [], folderStructure: 'services/\n├── user-service/\n├── product-service/\n└── api-gateway/' },
      'desktop-app':   { pattern: 'MVC', layers: ['View', 'Controller', 'Model'], components: [], folderStructure: 'src/\n├── views/\n├── controllers/\n└── models/' },
      'cms':           { pattern: 'Plugin Architecture', layers: ['Core', 'Plugins', 'Themes'], components: [], folderStructure: 'src/\n├── core/\n├── plugins/\n└── themes/' },
      'ecommerce':     { pattern: 'Modular Monolith', layers: ['Catalog', 'Cart', 'Checkout', 'Payment'], components: [], folderStructure: 'src/\n├── catalog/\n├── cart/\n├── checkout/\n└── payment/' },
      'dashboard':     { pattern: 'Component-Service', layers: ['Presentation', 'Data Visualization', 'Data Access'], components: [], folderStructure: 'src/\n├── components/\n├── charts/\n├── services/\n└── models/' },
      'other':         { pattern: 'Layered Architecture', layers: ['Presentation', 'Business', 'Data'], components: [], folderStructure: 'src/\n├── components/\n├── services/\n└── models/' },
    };
    return map[type];
  }

  private generateSummary(text: string, type: ProjectType): string {
    const name = this.extractProjectName(text);
    const techs = this.detectTechnologies(text);
    const reqs = this.extractRequirements(text);
    const typeLabels: Record<ProjectType, string> = {
      'web-app': 'aplicación web', 'api': 'API REST', 'mobile-app': 'app móvil',
      'desktop-app': 'app de escritorio', 'microservices': 'arquitectura de microservicios',
      'cms': 'CMS', 'ecommerce': 'tienda online', 'dashboard': 'dashboard analítico', 'other': 'proyecto de software'
    };
    const techStr = techs.length > 0 ? ` usando ${techs.slice(0, 3).join(', ')}` : '';
    const reqStr = reqs.length > 0 ? ` con ${reqs.length} requisito(s) identificado(s)` : '';
    return `${name} es una ${typeLabels[type]}${techStr}${reqStr}.`;
  }

  private computeConfidence(text: string, type: ProjectType): { score: number; detail: string } {
    const lower = text.toLowerCase();
    const checks: [ProjectType, string[]][] = [
      ['ecommerce',     ['tienda', 'e-commerce', 'carrito', 'compra', 'venta online', 'shop', 'checkout', 'pago', 'producto', 'inventario', 'pedido']],
      ['dashboard',     ['dashboard', 'panel de control', 'analytics', 'métricas', 'reportes', 'gráficas', 'estadísticas', 'kpi', 'indicador']],
      ['api',           ['api', 'rest', 'graphql', 'endpoint', 'backend', 'servidor', 'microservicio', 'swagger', 'openapi']],
      ['mobile-app',    ['móvil', 'mobile', 'android', 'ios', 'react native', 'flutter', 'app móvil', 'smartphone', 'tablet']],
      ['desktop-app',   ['escritorio', 'desktop', 'electron', 'aplicación de escritorio', 'windows app', 'macos app']],
      ['microservices', ['microservicio', 'microservice', 'arquitectura distribuida', 'contenedor', 'docker', 'kubernetes', 'k8s']],
      ['cms',           ['cms', 'gestor de contenido', 'blog', 'wordpress', 'publicaciones', 'artículo', 'editorial']],
      ['web-app',       ['aplicación web', 'web app', 'spa', 'frontend', 'react', 'angular', 'vue', 'página web', 'sitio web', 'portal']],
    ];
    const entry = checks.find(([t]) => t === type);
    if (!entry) return { score: 3, detail: 'Tipo detectado por defecto' };
    const matched = entry[1].filter(k => lower.includes(k));
    const score = Math.min(10, matched.length + 1);
    const detail = `${matched.length}/${entry[1].length} keywords de ${type} encontradas`;
    return { score, detail };
  }

  getStackSuggestions(type: ProjectType): StackSuggestion[] {
    const map: Record<ProjectType, StackSuggestion[]> = {
      'web-app': [
        { name: 'React + Vite', techs: ['React', 'TypeScript', 'Vite', 'Tailwind'], description: 'SPA moderna y rápida' },
        { name: 'Angular', techs: ['Angular', 'TypeScript', 'RxJS'], description: 'Framework empresarial completo' },
        { name: 'Next.js', techs: ['Next.js', 'TypeScript', 'Tailwind', 'Prisma'], description: 'Full-stack con SSR' },
      ],
      'api': [
        { name: 'Express + Prisma', techs: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'PostgreSQL'], description: 'API REST clásica' },
        { name: 'NestJS', techs: ['NestJS', 'TypeScript', 'Prisma', 'PostgreSQL'], description: 'Framework estructurado' },
        { name: 'FastAPI', techs: ['Python', 'FastAPI', 'PostgreSQL'], description: 'API Python de alto rendimiento' },
      ],
      'mobile-app': [
        { name: 'React Native + Expo', techs: ['React Native', 'TypeScript', 'Expo'], description: 'Cross-platform iOS/Android' },
        { name: 'Flutter', techs: ['Flutter', 'Dart'], description: 'UI nativa de alto rendimiento' },
      ],
      'ecommerce': [
        { name: 'Next.js + Stripe', techs: ['Next.js', 'TypeScript', 'Stripe', 'Prisma', 'PostgreSQL'], description: 'E-commerce full-stack' },
        { name: 'React + Node.js', techs: ['React', 'Node.js', 'Express', 'Stripe', 'MongoDB'], description: 'Stack MERN con pagos' },
      ],
      'dashboard': [
        { name: 'React + Recharts', techs: ['React', 'TypeScript', 'Recharts', 'TanStack Table'], description: 'Dashboard con gráficas' },
        { name: 'Vue + Chart.js', techs: ['Vue', 'TypeScript', 'Chart.js', 'Pinia'], description: 'Dashboard Vue moderno' },
      ],
      'microservices': [
        { name: 'Node.js + Docker', techs: ['Node.js', 'TypeScript', 'Docker', 'PostgreSQL', 'Redis'], description: 'Microservicios containerizados' },
      ],
      'desktop-app': [
        { name: 'Electron + React', techs: ['Electron', 'React', 'TypeScript'], description: 'App de escritorio cross-platform' },
      ],
      'cms': [
        { name: 'Next.js + Payload', techs: ['Next.js', 'TypeScript', 'PostgreSQL'], description: 'CMS headless moderno' },
      ],
      'other': [
        { name: 'Node.js + TypeScript', techs: ['Node.js', 'TypeScript', 'PostgreSQL'], description: 'Stack genérico robusto' },
      ],
    };
    return map[type] ?? map['other'];
  }
}
