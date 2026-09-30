import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const [user] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, req.session.userId!));
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const profileSchema = z.object({
  name: z.string().min(1).max(100),
});

router.put('/', async (req: Request, res: Response) => {
  try {
    const data = profileSchema.parse(req.body);
    const userId = req.session.userId!;

    const [user] = await db.update(users)
      .set({
        name: data.name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id, name: users.name, email: users.email });

    res.json(user);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
