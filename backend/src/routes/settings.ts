import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { userSettings } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, req.session.userId!));
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const settingsSchema = z.object({
  enabledEvents: z.array(z.string()),
  thresholds: z.record(z.string(), z.number().min(0).max(1)),
  cooldownSeconds: z.number().min(30).max(3600),
  locationSharing: z.boolean(),
});

router.put('/', async (req: Request, res: Response) => {
  try {
    const data = settingsSchema.parse(req.body);
    const userId = req.session.userId!;

    const [settings] = await db.update(userSettings)
      .set({
        enabledEvents: data.enabledEvents,
        thresholds: data.thresholds,
        cooldownSeconds: data.cooldownSeconds,
        locationSharing: data.locationSharing,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId))
      .returning();

    res.json(settings);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
