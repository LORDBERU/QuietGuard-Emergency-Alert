import { Router, Request, Response } from 'express';
import argon2 from 'argon2';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users, userSettings } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const passwordHash = await argon2.hash(data.password);

    const [newUser] = await db.insert(users).values({
      name: data.name,
      email: data.email,
      passwordHash,
    }).returning();

    await db.insert(userSettings).values({
      userId: newUser.id,
    });

    req.session.userId = newUser.id;
    res.status(201).json({ user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, data.email));

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await argon2.verify(user.passwordHash, data.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session regeneration failed' });
      req.session.userId = user.id;
      res.json({ user: { id: user.id, name: user.name, email: user.email } });
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const [user] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, req.session.userId!));
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/csrf-token', (req: Request, res: Response) => {
  const token = crypto.randomBytes(32).toString('hex');
  req.session.csrfToken = token;
  res.json({ csrfToken: token });
});

export default router;
