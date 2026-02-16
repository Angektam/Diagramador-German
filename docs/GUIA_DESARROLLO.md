# Guía de Desarrollo - Diagramador SQL

## 🎯 Configuración Inicial

### Prerrequisitos
- Node.js 18+ 
- npm 9+
- Git
- Editor de código (VS Code recomendado)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd diagramador
   ```

2. **Instalar dependencias del frontend**
   ```bash
   npm install
   ```

3. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configurar variables de entorno**
   ```bash
   cd backend
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

## 🚀 Desarrollo

### Ejecutar solo Frontend

```bash
npm start
```

Abre http://localhost:4200

### Ejecutar solo Backend

```bash
cd backend
npm run dev
```

API disponible en http://localhost:3000

### Ejecutar Frontend + Backend

Terminal 1:
```bash
npm start
```

Terminal 2:
```bash
cd backend
npm run dev
```

## 🏗️ Estructura de Desarrollo

### Frontend (Angular)

#### Crear nuevo componente
```bash
ng generate component components/mi-componente
```

#### Crear nuevo servicio
```bash
ng generate service services/mi-servicio
```

#### Agregar dependencia
```bash
npm install <paquete>
```

### Backend (Node.js/Express)

#### Estructura de archivos

```
backend/src/
├── routes/
│   └── diagrams.routes.ts      # Rutas de diagramas
├── controllers/
│   └── diagrams.controller.ts  # Lógica de controladores
├── services/
│   └── diagrams.service.ts     # Lógica de negocio
├── models/
│   └── diagram.model.ts        # Modelos de datos
├── middleware/
│   ├── auth.middleware.ts      # Autenticación
│   └── validation.middleware.ts # Validación
└── utils/
    └── helpers.ts              # Funciones auxiliares
```

#### Ejemplo de ruta

```typescript
// routes/diagrams.routes.ts
import { Router } from 'express';
import { DiagramsController } from '../controllers/diagrams.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new DiagramsController();

router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getById);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

export default router;
```

#### Ejemplo de controlador

```typescript
// controllers/diagrams.controller.ts
import { Request, Response } from 'express';
import { DiagramsService } from '../services/diagrams.service';

export class DiagramsController {
  private service = new DiagramsService();

  getAll = async (req: Request, res: Response) => {
    try {
      const diagrams = await this.service.findAll(req.user.id);
      res.json(diagrams);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener diagramas' });
    }
  };

  // ... más métodos
}
```

## 🔌 Integración Frontend-Backend

### 1. Configurar Proxy en Angular

Ya está configurado en `proxy.conf.json`. Actualizar `angular.json`:

```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

### 2. Crear servicio HTTP en Angular

```typescript
// services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Diagram } from '../../../shared/models/diagram.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api'; // Proxy redirige a localhost:3000

  constructor(private http: HttpClient) {}

  getDiagrams(): Observable<Diagram[]> {
    return this.http.get<Diagram[]>(`${this.apiUrl}/diagrams`);
  }

  getDiagram(id: string): Observable<Diagram> {
    return this.http.get<Diagram>(`${this.apiUrl}/diagrams/${id}`);
  }

  createDiagram(diagram: Partial<Diagram>): Observable<Diagram> {
    return this.http.post<Diagram>(`${this.apiUrl}/diagrams`, diagram);
  }

  updateDiagram(id: string, diagram: Partial<Diagram>): Observable<Diagram> {
    return this.http.put<Diagram>(`${this.apiUrl}/diagrams/${id}`, diagram);
  }

  deleteDiagram(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/diagrams/${id}`);
  }
}
```

### 3. Usar el servicio en componentes

```typescript
export class EditorComponent implements OnInit {
  diagrams: Diagram[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDiagrams();
  }

  loadDiagrams() {
    this.apiService.getDiagrams().subscribe({
      next: (diagrams) => {
        this.diagrams = diagrams;
      },
      error: (error) => {
        console.error('Error al cargar diagramas:', error);
      }
    });
  }

  saveDiagram(diagram: Diagram) {
    this.apiService.createDiagram(diagram).subscribe({
      next: (saved) => {
        console.log('Diagrama guardado:', saved);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
      }
    });
  }
}
```

## 🧪 Testing

### Frontend (Angular)

```bash
# Unit tests
npm test

# Coverage
npm test -- --code-coverage

# E2E tests
npm run e2e
```

### Backend (Node.js)

```bash
cd backend

# Tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 🔍 Debugging

### Frontend (VS Code)

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Angular Debug",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

### Backend (VS Code)

```json
{
  "type": "node",
  "request": "launch",
  "name": "Backend Debug",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "cwd": "${workspaceFolder}/backend",
  "console": "integratedTerminal"
}
```

## 📝 Convenciones de Código

### TypeScript
- Usar `interface` para tipos de datos
- Usar `type` para uniones y tipos complejos
- Siempre tipar parámetros y retornos
- Evitar `any`, usar `unknown` si es necesario

### Nombres
- Componentes: `PascalCase` (ej: `DiagramEditor`)
- Servicios: `camelCase` con sufijo `.service` (ej: `diagram.service.ts`)
- Variables: `camelCase` (ej: `currentDiagram`)
- Constantes: `UPPER_SNAKE_CASE` (ej: `MAX_TABLES`)
- Interfaces: `PascalCase` con prefijo `I` opcional (ej: `Diagram` o `IDiagram`)

### Comentarios
```typescript
/**
 * Descripción de la función
 * @param id - ID del diagrama
 * @returns Diagrama encontrado
 */
async getDiagram(id: string): Promise<Diagram> {
  // Implementación
}
```

## 🚢 Deployment

### Frontend (Build)

```bash
npm run build
```

Output en `dist/diagramador/`

### Backend (Build)

```bash
cd backend
npm run build
```

Output en `backend/dist/`

### Variables de Entorno (Producción)

```bash
# Frontend
NODE_ENV=production
API_URL=https://api.tudominio.com

# Backend
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=<secret-seguro>
CORS_ORIGIN=https://tudominio.com
```

## 🐛 Solución de Problemas

### Error: Cannot find module

```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: Port already in use

```bash
# Cambiar puerto en angular.json o .env
# O matar el proceso:
lsof -ti:4200 | xargs kill -9  # Frontend
lsof -ti:3000 | xargs kill -9  # Backend
```

### Error: CORS

Verificar configuración en `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

## 📚 Recursos Útiles

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [REST API Design](https://restfulapi.net/)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📞 Soporte

Para preguntas o problemas, abrir un issue en el repositorio.
