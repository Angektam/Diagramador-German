# Estructura del Proyecto Diagramador SQL

## 📁 Organización General

```
diagramador/
├── frontend/              # [FUTURO] Aplicación Angular
│   ├── src/
│   ├── angular.json
│   └── package.json
│
├── backend/               # API Node.js/Express
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── routes/            # Rutas API
│   │   ├── controllers/       # Controladores
│   │   ├── services/          # Lógica de negocio
│   │   ├── models/            # Modelos de datos
│   │   ├── middleware/        # Middleware
│   │   └── utils/             # Utilidades
│   ├── dist/                  # Build output
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── shared/                # Código compartido
│   ├── models/
│   │   └── diagram.interface.ts
│   └── README.md
│
├── docs/                  # Documentación
│   ├── DOCUMENTACION_COMPLETA.md
│   ├── ARQUITECTURA_REORGANIZACION.md
│   ├── MEJORAS_SUGERIDAS.md
│   └── ESTRUCTURA_PROYECTO.md (este archivo)
│
├── src/                   # [ACTUAL] Frontend Angular (raíz temporal)
│   └── app/
│
├── README.md              # README principal
├── package.json           # [ACTUAL] Frontend package.json
└── angular.json           # [ACTUAL] Configuración Angular
```

## 🎯 Estado Actual

### ✅ Implementado
- Frontend Angular completo en la raíz del proyecto
- Estructura de backend preparada en `/backend`
- Tipos compartidos en `/shared`
- Documentación organizada en `/docs`

### 🔄 Próximos Pasos

1. **Migración del Frontend** (Opcional)
   - Mover todo el contenido de `src/` a `frontend/src/`
   - Actualizar rutas en `angular.json`
   - Actualizar scripts en `package.json`

2. **Desarrollo del Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Integración Frontend-Backend**
   - Configurar proxy en Angular
   - Implementar servicios HTTP
   - Conectar autenticación

## 🔌 Comunicación Frontend-Backend

### Configuración de Proxy (Angular)

Crear `proxy.conf.json` en la raíz:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Actualizar `angular.json`:

```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

### Variables de Entorno

#### Frontend (`src/environments/`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

#### Backend (`.env`)
```
PORT=3000
CORS_ORIGIN=http://localhost:4200
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

## 📦 Dependencias

### Frontend
- Angular 18
- RxJS
- TypeScript

### Backend
- Express
- TypeScript
- JWT
- Bcrypt
- PostgreSQL (futuro)

### Shared
- TypeScript (solo tipos)

## 🚀 Scripts de Desarrollo

### Desarrollo Completo (Futuro)

Crear `package.json` en la raíz para orquestar ambos:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm start",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build"
  }
}
```

## 🔒 Seguridad

### Frontend
- Guards para rutas protegidas
- Validación de inputs
- Sanitización de SQL
- XSS protection

### Backend
- JWT authentication
- Rate limiting
- Input validation
- SQL injection prevention
- CORS configurado

## 📊 Flujo de Datos

```
Usuario → Frontend (Angular)
           ↓
    HTTP Request (JSON)
           ↓
    Backend (Express API)
           ↓
    Base de Datos (PostgreSQL)
           ↓
    Response (JSON)
           ↓
    Frontend (Actualización UI)
```

## 🧪 Testing

### Frontend
```bash
npm test                    # Unit tests
npm run e2e                 # E2E tests
```

### Backend
```bash
cd backend
npm test                    # Jest tests
npm run test:coverage       # Coverage report
```

## 📝 Convenciones

### Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Documentación
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Tareas de mantenimiento

### Branches
- `main` - Producción
- `develop` - Desarrollo
- `feature/*` - Nuevas funcionalidades
- `fix/*` - Correcciones

## 🎨 Estándares de Código

- TypeScript strict mode
- ESLint + Prettier
- Comentarios JSDoc
- Nombres descriptivos
- Componentes pequeños y reutilizables

## 📚 Recursos

- [Angular Docs](https://angular.io/docs)
- [Express Docs](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
