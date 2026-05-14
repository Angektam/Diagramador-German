import { Injectable } from '@angular/core';
import { ProjectType } from '../models/project-info.interface';

export interface PredefinedTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  projectType: ProjectType;
  technologies: string[];
  requirements: string[];
  features: string[];
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class PredefinedTemplatesService {

  readonly templates: PredefinedTemplate[] = [
    {
      id: 'saas-starter',
      name: 'SaaS Starter',
      description: 'Plataforma SaaS con autenticación, suscripciones y dashboard',
      icon: '🚀',
      projectType: 'web-app',
      technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Stripe', 'Tailwind'],
      requirements: [
        'Autenticación con email/password y OAuth (Google, GitHub)',
        'Sistema de suscripciones con Stripe (Free, Pro, Enterprise)',
        'Dashboard de usuario con métricas de uso',
        'Panel de administración para gestionar usuarios',
        'Emails transaccionales (bienvenida, factura, recuperación)',
        'API REST documentada con Swagger',
      ],
      features: ['Auth multi-provider', 'Billing con Stripe', 'Dashboard analítico', 'Admin panel', 'Email notifications'],
      tags: ['saas', 'startup', 'subscription']
    },
    {
      id: 'ecommerce-full',
      name: 'E-commerce Completo',
      description: 'Tienda online con catálogo, carrito, pagos y panel admin',
      icon: '🛒',
      projectType: 'ecommerce',
      technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Stripe', 'Redis'],
      requirements: [
        'Catálogo de productos con categorías, filtros y búsqueda',
        'Carrito de compras persistente (localStorage + DB)',
        'Checkout con Stripe (tarjeta, PayPal)',
        'Gestión de inventario con alertas de stock bajo',
        'Panel admin: productos, pedidos, usuarios, reportes',
        'Historial de pedidos y tracking de envíos',
        'Sistema de reseñas y valoraciones',
      ],
      features: ['Catálogo', 'Carrito', 'Checkout', 'Admin panel', 'Inventario', 'Reseñas'],
      tags: ['ecommerce', 'tienda', 'stripe']
    },
    {
      id: 'api-rest',
      name: 'API REST Empresarial',
      description: 'API REST con auth JWT, CRUD completo, documentación y tests',
      icon: '⚡',
      projectType: 'api',
      technologies: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'PostgreSQL', 'Redis', 'Jest'],
      requirements: [
        'Autenticación JWT con refresh tokens y revocación',
        'RBAC (Role-Based Access Control) con roles: admin, user, guest',
        'Rate limiting por IP y por usuario autenticado',
        'Validación de inputs con Zod en todos los endpoints',
        'Documentación automática con Swagger/OpenAPI',
        'Logging estructurado con Winston',
        'Tests unitarios e integración con Jest',
        'Cache con Redis para endpoints frecuentes',
      ],
      features: ['JWT Auth', 'RBAC', 'Rate limiting', 'Swagger docs', 'Redis cache', 'Tests'],
      tags: ['api', 'rest', 'backend', 'jwt']
    },
    {
      id: 'dashboard-analytics',
      name: 'Dashboard Analítico',
      description: 'Panel de control con gráficas, KPIs y reportes exportables',
      icon: '📊',
      projectType: 'dashboard',
      technologies: ['React', 'TypeScript', 'Recharts', 'TanStack Table', 'Zustand', 'Tailwind'],
      requirements: [
        'KPIs en tiempo real con actualización automática',
        'Gráficas: líneas, barras, pie, área (Recharts)',
        'Tablas con paginación, ordenamiento y filtros',
        'Exportar reportes a CSV y PDF',
        'Filtros por rango de fechas y categorías',
        'Modo oscuro/claro',
        'Responsive para móvil y desktop',
      ],
      features: ['KPIs', 'Gráficas', 'Tablas', 'Exportar CSV/PDF', 'Filtros', 'Dark mode'],
      tags: ['dashboard', 'analytics', 'charts']
    },
    {
      id: 'mobile-app',
      name: 'App Móvil React Native',
      description: 'Aplicación móvil iOS/Android con auth, navegación y API',
      icon: '📱',
      projectType: 'mobile-app',
      technologies: ['React Native', 'TypeScript', 'Expo', 'React Navigation', 'Zustand', 'AsyncStorage'],
      requirements: [
        'Autenticación con email/password y biometría',
        'Navegación con tabs y stack (React Navigation v6)',
        'Modo offline con sincronización automática',
        'Push notifications (Expo Notifications)',
        'Cámara y galería de fotos',
        'Almacenamiento seguro de tokens (SecureStore)',
      ],
      features: ['Auth + biometría', 'Navegación', 'Offline mode', 'Push notifications', 'Cámara'],
      tags: ['mobile', 'react-native', 'expo']
    },
    {
      id: 'cms-blog',
      name: 'CMS / Blog',
      description: 'Sistema de gestión de contenido con editor y SEO',
      icon: '📝',
      projectType: 'cms',
      technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Tailwind'],
      requirements: [
        'Editor de contenido rich-text (TipTap o Quill)',
        'Gestión de categorías, tags y autores',
        'SEO: meta tags, Open Graph, sitemap.xml, robots.txt',
        'Búsqueda full-text en artículos',
        'Sistema de comentarios con moderación',
        'Programación de publicaciones',
        'Imágenes optimizadas con Next/Image',
      ],
      features: ['Editor rich-text', 'SEO', 'Búsqueda', 'Comentarios', 'Programación'],
      tags: ['cms', 'blog', 'seo', 'content']
    },
    {
      id: 'microservices',
      name: 'Microservicios con Docker',
      description: 'Arquitectura de microservicios containerizada con API Gateway',
      icon: '🔧',
      projectType: 'microservices',
      technologies: ['Node.js', 'TypeScript', 'Docker', 'PostgreSQL', 'Redis', 'RabbitMQ'],
      requirements: [
        'API Gateway con autenticación centralizada',
        'Servicio de usuarios con JWT',
        'Servicio de productos con cache Redis',
        'Message queue con RabbitMQ para eventos',
        'Health checks y circuit breaker',
        'Docker Compose para desarrollo local',
        'Logging centralizado',
      ],
      features: ['API Gateway', 'JWT centralizado', 'Message queue', 'Circuit breaker', 'Docker Compose'],
      tags: ['microservices', 'docker', 'distributed']
    },
    {
      id: 'desktop-electron',
      name: 'App Desktop Electron',
      description: 'Aplicación de escritorio cross-platform con React y SQLite',
      icon: '🖥️',
      projectType: 'desktop-app',
      technologies: ['Electron', 'React', 'TypeScript', 'SQLite', 'Tailwind'],
      requirements: [
        'Ventana principal con menú nativo',
        'Base de datos local SQLite con migraciones',
        'Actualizaciones automáticas (electron-updater)',
        'Notificaciones del sistema',
        'Acceso al sistema de archivos',
        'Modo offline completo',
        'Empaquetado para Windows, macOS y Linux',
      ],
      features: ['SQLite local', 'Auto-update', 'Notificaciones', 'File system', 'Cross-platform'],
      tags: ['desktop', 'electron', 'offline']
    },
  ];

  getById(id: string): PredefinedTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  getByType(type: ProjectType): PredefinedTemplate[] {
    return this.templates.filter(t => t.projectType === type);
  }
}
