import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import alertsRoutes from './routes/alerts.js';
import contactsRoutes from './routes/contacts.js';
import settingsRoutes from './routes/settings.js';
import profileRoutes from './routes/profile.js';
import { csrfCheck } from './middleware/csrf.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const PostgresqlStore = pgSession(session);

app.use(session({
  store: new PostgresqlStore({
    pool: pgPool,
    tableName: 'session',
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}));

declare module 'express-session' {
  interface SessionData {
    userId: string;
    csrfToken: string;
  }
}

app.use('/api', csrfCheck);

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
