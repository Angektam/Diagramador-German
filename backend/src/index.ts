import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';
const SHARE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200'
}));
app.use(express.json());

type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
};

type ShareEntry = {
  id: string;
  content: string;
  createdAt: number;
};

const users = new Map<string, User>();
const shares = new Map<string, ShareEntry>();

function createToken(user: Pick<User, 'id' | 'username' | 'email'>): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '8h' });
}

function seedUsers() {
  const demo = [
    { id: '1', username: 'admin', email: 'admin@diagramador.com', password: 'admin123' },
    { id: '2', username: 'usuario', email: 'usuario@diagramador.com', password: '123456' },
    { id: '3', username: 'demo', email: 'demo@diagramador.com', password: 'demo' }
  ];
  for (const entry of demo) {
    const passwordHash = bcrypt.hashSync(entry.password, 10);
    users.set(entry.username.toLowerCase(), { ...entry, passwordHash });
  }
}

seedUsers();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
  }

  const user = users.get(String(username).toLowerCase());
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(String(password), user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });

  const token = createToken(user);
  return res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email }
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body ?? {};
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }
  const key = String(username).toLowerCase();
  if (users.has(key)) return res.status(409).json({ message: 'Usuario ya existe' });

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user: User = {
    id: randomUUID(),
    username: String(username).trim(),
    email: String(email).trim().toLowerCase(),
    passwordHash
  };
  users.set(key, user);
  return res.status(201).json({ user: { id: user.id, username: user.username, email: user.email } });
});

app.post('/api/share', (req, res) => {
  const { content } = req.body ?? {};
  if (!content || typeof content !== 'string' || content.trim().length < 20) {
    return res.status(400).json({ message: 'Contenido inválido' });
  }
  if (content.length > 200000) {
    return res.status(413).json({ message: 'Prompt demasiado grande para compartir' });
  }

  const id = randomUUID().replace(/-/g, '').slice(0, 12);
  shares.set(id, { id, content, createdAt: Date.now() });
  return res.status(201).json({ id });
});

app.get('/api/share/:id', (req, res) => {
  const id = req.params.id;
  const item = shares.get(id);
  if (!item) return res.status(404).json({ message: 'No encontrado' });

  if (Date.now() - item.createdAt > SHARE_TTL_MS) {
    shares.delete(id);
    return res.status(404).json({ message: 'Expirado' });
  }

  return res.json({ id: item.id, content: item.content });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Diagramador API v2.0' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
