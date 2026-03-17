import { Injectable } from '@angular/core';
import { ProjectInfo, ProjectType, Requirement, Feature } from '../models/project-info.interface';

@Injectable({ providedIn: 'root' })
export class DocumentAnalyzerService {

  analyzeDocuments(documents: string[]): ProjectInfo {
    const combined = documents.join('\n\n');
    const type = this.detectProjectType(combined);
    return {
      name: this.extractProjectName(combined),
      description: this.extractDescription(combined),
      type,
      technologies: this.detectTechnologies(combined),
      requirements: this.extractRequirements(combined),
      features: this.extractFeatures(combined),
      architecture: this.suggestArchitecture(type)
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
      ['ecommerce',     ['tienda', 'e-commerce', 'carrito', 'compra', 'venta online', 'shop', 'checkout', 'pago']],
      ['dashboard',     ['dashboard', 'panel de control', 'analytics', 'métricas', 'reportes', 'gráficas', 'estadísticas']],
      ['api',           ['api', 'rest', 'graphql', 'endpoint', 'backend', 'servidor', 'microservicio']],
      ['mobile-app',    ['móvil', 'mobile', 'android', 'ios', 'react native', 'flutter', 'app móvil']],
      ['desktop-app',   ['escritorio', 'desktop', 'electron', 'aplicación de escritorio']],
      ['microservices', ['microservicio', 'microservice', 'arquitectura distribuida', 'contenedor', 'docker']],
      ['cms',           ['cms', 'gestor de contenido', 'blog', 'wordpress', 'publicaciones']],
      ['web-app',       ['aplicación web', 'web app', 'spa', 'frontend', 'react', 'angular', 'vue', 'página web', 'sitio web']],
    ];
    for (const [type, keywords] of checks) {
      if (keywords.some(k => lower.includes(k))) return type;
    }
    return 'other';
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
      // Explícitos
      /(?:debe(?:rá)?|should|necesita|requiere|tiene que|es necesario que)\s+(.{15,150})/gi,
      // Listas con viñetas o números
      /^[\s]*(?:\d+\.|[-*•])\s+(.{15,150})/gm,
      // Funcionalidades
      /(?:funcionalidad|módulo|característica|feature)\s*[:\-]\s*(.{10,120})/gi,
      // El sistema / la app
      /(?:el sistema|la aplicación|la plataforma|el usuario)\s+(?:debe|podrá|permitirá|tendrá)\s+(.{10,120})/gi,
    ];

    for (const pattern of patterns) {
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        const desc = m[1].trim().replace(/[.;,]+$/, '');
        const key = desc.toLowerCase().slice(0, 40);
        if (desc.length > 10 && !seen.has(key)) {
          seen.add(key);
          reqs.push({
            id: `REQ-${id++}`,
            type: this.classifyReq(desc),
            description: desc,
            priority: this.priorityOf(desc)
          });
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
}
