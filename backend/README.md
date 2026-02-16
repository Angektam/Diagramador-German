# Diagramador Backend API

API REST para el sistema de diagramación SQL.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## 📁 Estructura

```
backend/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/           # Rutas API
│   ├── controllers/      # Controladores
│   ├── services/         # Lógica de negocio
│   ├── models/           # Modelos de datos
│   ├── middleware/       # Middleware personalizado
│   └── utils/            # Utilidades
├── dist/                 # Build output
└── package.json
```

## 🔌 Endpoints (Planificados)

### Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Refresh token

### Diagramas
- `GET /api/diagrams` - Listar diagramas
- `GET /api/diagrams/:id` - Obtener diagrama
- `POST /api/diagrams` - Crear diagrama
- `PUT /api/diagrams/:id` - Actualizar diagrama
- `DELETE /api/diagrams/:id` - Eliminar diagrama

### SQL
- `POST /api/sql/parse` - Parsear SQL
- `POST /api/sql/validate` - Validar SQL
- `POST /api/sql/generate` - Generar SQL desde diagrama

## 🔒 Seguridad

- JWT para autenticación
- Bcrypt para passwords
- CORS configurado
- Rate limiting (pendiente)
- Validación de inputs

## 🗄️ Base de Datos

Preparado para PostgreSQL. Esquema pendiente de definir.
