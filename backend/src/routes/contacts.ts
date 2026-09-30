import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { alertContacts } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const [contact] = await db.select().from(alertContacts).where(eq(alertContacts.userId, req.session.userId!));
    res.json(contact || null);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  enabled: z.boolean(),
});

router.put('/', async (req: Request, res: Response) => {
  try {
    const data = contactSchema.parse(req.body);
    const userId = req.session.userId!;

    const [contact] = await db.insert(alertContacts).values({
      userId,
      name: data.name,
      email: data.email,
      enabled: data.enabled,
    }).onConflictDoUpdate({
      target: alertContacts.userId,
      set: {
        name: data.name,
        email: data.email,
        enabled: data.enabled,
        updatedAt: new Date(),
      }
    }).returning();

    res.json(contact);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
