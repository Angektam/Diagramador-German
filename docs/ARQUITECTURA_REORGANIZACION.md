# Plan de Reorganización - Arquitectura Frontend/Backend

## Objetivo
Separar claramente el frontend del backend para tener una arquitectura más profesional, escalable y mantenible.

---

## Estructura Actual vs Nueva

### Actual (Todo en Frontend)
```
src/
├── app/
│   ├── components/     # 13 componentes mezclados
│   ├── services/       # 5 servicios (lógica + datos)
│   ├── models/         # Interfaces
│   └── guards/         # Guards de rutas
```

### Nueva Estructura Propuesta

```
proyecto/
├── frontend/                    # Angular App
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Funcionalidad core
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── services/   # Servicios de infraestructura
│   │   │   │   └── models/
│   │   │   │
│   │   │   ├── features/       # Módulos por funcionalidad
│   │   │   │   ├── auth/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── login/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── models/
│   │   │   │   │
│   │   │   │   ├── diagram/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── canvas/
│   │   │   │   │   │   ├── toolbar/
│   │   │   │   │   │   ├── shapes-panel/
│   │   │   │   │   │   └── format-panel/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── models/
│   │   │   │   │
│   │   │   │   ├── assistant/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── chat-assistant/
│   │   │   │   │   │   └── diagram-wizard/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── models/
│   │   │   │   │
│   │   │   │   ├── gallery/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── map-gallery/
│   │   │   │   │   │   └── templates-modal/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── models/
│   │   │   │   │
│   │   │   │   └── sql/
│   │   │   │       ├── components/
│   │   │   │       │   ├── modal-sql/
│   │   │   │       │   └── modal-table/
│   │   │   │       ├── services/
│   │   │   │       └── models/
│   │   │   │
│   │   │   ├── shared/         # Componentes compartidos
│   │   │   │   ├── components/
│   │   │   │   │   └── notification-container/
│   │   │   │   ├── directives/
│   │   │   │   ├── pipes/
│   │   │   │   └── utils/
│   │   │   │
│   │   │   └── layout/         # Layouts principales
│   │   │       ├── main-layout/
│   │   │       └── auth-layout/
│   │   │
│   │   ├── assets/
│   │   ├── environments/
│   │   └── styles/
│   │       ├── _variables.css
│   │       ├── _mixins.css
│   │       ├── _components.css
│   │       └── styles.css
│   │
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
└── backend/                     # Node.js + Express API
    ├── src/
    │   ├── config/             # Configuración
    │   │   ├── database.ts
    │   │   └── environment.ts
    │   │
    │   ├── modules/            # Módulos por funcionalidad
    │   │   ├── auth/
    │   │   │   ├── auth.controller.ts
    │   │   │   ├── auth.service.ts
    │   │   │   ├── auth.routes.ts
    │   │   │   └── auth.dto.ts
    │   │   │
    │   │   ├── diagrams/
    │   │   │   ├── diagrams.controller.ts
    │   │   │   ├── diagrams.service.ts
    │   │   │   ├── diagrams.routes.ts
    │   │   │   └── diagrams.dto.ts
    │   │   │
    │   │   ├── users/
    │   │   │   ├── users.controller.ts
    │   │   │   ├── users.service.ts
    │   │   │   ├── users.routes.ts
    │   │   │   └── users.dto.ts
    │   │   │
    │   │   ├── sql-parser/
    │   │   │   ├── sql-parser.controller.ts
    │   │   │   ├── sql-parser.service.ts
    │   │   │   └── sql-parser.routes.ts
    │   │   │
    │   │   └── ai-assistant/
    │   │       ├── ai-assistant.controller.ts
    │   │       ├── ai-assistant.service.ts
    │   │       └── ai-assistant.routes.ts
    │   │
    │   ├── middleware/         # Middlewares
    │   │   ├── auth.middleware.ts
    │   │   ├── validation.middleware.ts
    │   │   └── error.middleware.ts
    │   │
    │   ├── models/             # Modelos de BD
    │   │   ├── user.model.ts
    │   │   ├── diagram.model.ts
    │   │   └── template.model.ts
    │   │
    │   ├── utils/              # Utilidades
    │   │   ├── logger.ts
    │   │   ├── validators.ts
    │   │   └── helpers.ts
    │   │
    │   ├── app.ts              # Configuración Express
    │   └── server.ts           # Punto de entrada
    │
    ├── tests/                  # Tests
    ├── package.json
    └── tsconfig.json
```

---

## Fase 1: Reorganización del Frontend

### 1.1 Crear Estructura de Carpetas

```bash
# Core
mkdir -p src/app/core/{guards,interceptors,services,models}

# Features
mkdir -p src/app/features/auth/{components/login,services,models}
mkdir -p src/app/features/diagram/{components/{canvas,toolbar,shapes-panel,format-panel},services,models}
mkdir -p src/app/features/assistant/{components/{chat-assistant,diagram-wizard},services,models}
mkdir -p src/app/features/gallery/{components/{map-gallery,templates-modal},services,models}
mkdir -p src/app/features/sql/{components/{modal-sql,modal-table},services,models}

# Shared
mkdir -p src/app/shared/{components/notification-container,directives,pipes,utils}

# Layout
mkdir -p src/app/layout/{main-layout,auth-layout}

# Styles
mkdir -p src/styles
```

### 1.2 Mover Componentes

**Auth Feature**:
```
src/app/components/login/ 
  → src/app/features/auth/components/login/
```

**Diagram Feature**:
```
src/app/components/canvas/
  → src/app/features/diagram/components/canvas/

src/app/components/toolbar/
  → src/app/features/diagram/components/toolbar/

src/app/components/shapes-panel/
  → src/app/features/diagram/components/shapes-panel/

src/app/components/format-panel/
  → src/app/features/diagram/components/format-panel/

src/app/components/editor/
  → src/app/features/diagram/components/editor/
```

**Assistant Feature**:
```
src/app/components/chat-assistant/
  → src/app/features/assistant/components/chat-assistant/

src/app/components/diagram-wizard/
  → src/app/features/assistant/components/diagram-wizard/
```

**Gallery Feature**:
```
src/app/components/map-gallery/
  → src/app/features/gallery/components/map-gallery/

src/app/components/templates-modal/
  → src/app/features/gallery/components/templates-modal/
```

**SQL Feature**:
```
src/app/components/modal-sql/
  → src/app/features/sql/components/modal-sql/

src/app/components/modal-table/
  → src/app/features/sql/components/modal-table/
```

**Shared**:
```
src/app/components/notification-container/
  → src/app/shared/components/notification-container/
```

### 1.3 Mover Servicios

**Core Services** (infraestructura):
```
src/app/services/auth.service.ts
  → src/app/core/services/auth.service.ts

src/app/services/notification.service.ts
  → src/app/core/services/notification.service.ts

src/app/services/validation.service.ts
  → src/app/core/services/validation.service.ts
```

**Feature Services**:
```
src/app/services/diagram.service.ts
  → src/app/features/diagram/services/diagram.service.ts

src/app/services/chat-assistant.service.ts
  → src/app/features/assistant/services/chat-assistant.service.ts
```

### 1.4 Crear Barrel Exports

Cada feature tendrá un `index.ts` para exports limpios:

```typescript
// src/app/features/diagram/index.ts
export * from './components/canvas/canvas.component';
export * from './components/toolbar/toolbar.component';
export * from './services/diagram.service';
export * from './models/diagram.model';
```

---

## Fase 2: Preparar para Backend

### 2.1 Crear API Service (HTTP Client)

```typescript
// src/app/core/services/api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }
  
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data);
  }
  
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data);
  }
  
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }
}
```

### 2.2 Crear Interceptors

**Auth Interceptor**:
```typescript
// src/app/core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
```

**Error Interceptor**:
```typescript
// src/app/core/interceptors/error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error';
      
      if (error.error instanceof ErrorEvent) {
        // Error del cliente
        errorMessage = error.error.message;
      } else {
        // Error del servidor
        errorMessage = error.error?.message || error.message;
      }
      
      // Mostrar notificación
      inject(NotificationService).error(errorMessage);
      
      return throwError(() => error);
    })
  );
};
```

### 2.3 Actualizar Environment

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.diagramador.com/api',
  wsUrl: 'wss://api.diagramador.com'
};
```

---

## Fase 3: Crear Backend (Node.js + Express)

### 3.1 Inicializar Proyecto Backend

```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv bcrypt jsonwebtoken
npm install -D typescript @types/node @types/express ts-node nodemon
```

### 3.2 Estructura Básica

```typescript
// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './modules/auth/auth.routes';
import { diagramRoutes } from './modules/diagrams/diagrams.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/diagrams', diagramRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## Beneficios de la Reorganización

### Frontend
✅ **Modularidad**: Cada feature es independiente
✅ **Escalabilidad**: Fácil agregar nuevas features
✅ **Mantenibilidad**: Código organizado por funcionalidad
✅ **Reutilización**: Componentes shared claramente identificados
✅ **Testing**: Más fácil testear features aisladas
✅ **Lazy Loading**: Cargar features bajo demanda

### Backend
✅ **Separación de responsabilidades**: Frontend solo UI
✅ **Seguridad**: Lógica sensible en servidor
✅ **Performance**: Procesamiento pesado en backend
✅ **Escalabilidad**: Backend independiente del frontend
✅ **API RESTful**: Puede servir a múltiples clientes
✅ **Base de datos real**: Persistencia profesional

---

## Próximos Pasos

1. ✅ Crear estructura de carpetas
2. ✅ Mover componentes a features
3. ✅ Mover servicios
4. ✅ Crear barrel exports
5. ✅ Actualizar imports
6. ✅ Crear API service
7. ✅ Crear interceptors
8. ✅ Inicializar backend
9. ✅ Crear endpoints básicos
10. ✅ Conectar frontend con backend

