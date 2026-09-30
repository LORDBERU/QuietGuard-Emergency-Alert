import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { alertEvents, userSettings } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { alertLimiter } from '../middleware/rateLimiter.js';
import { dispatchAlert } from '../services/alertService.js';
import { eq, desc, and, gt } from 'drizzle-orm';

const router = Router();
router.use(requireAuth);

router.post('/manual', alertLimiter, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    
    // Check cooldown
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    const cooldownSeconds = settings?.cooldownSeconds ?? 300;
    
    const [lastEvent] = await db.select().from(alertEvents)
      .where(and(eq(alertEvents.userId, userId), eq(alertEvents.source, 'manual')))
      .orderBy(desc(alertEvents.occurredAt))
      .limit(1);

    if (lastEvent) {
      const secondsSinceLast = (new Date().getTime() - lastEvent.occurredAt.getTime()) / 1000;
      if (secondsSinceLast < cooldownSeconds) {
        return res.status(429).json({ error: 'Cooldown active. Please wait before triggering another manual alert.' });
      }
    }

    const [newEvent] = await db.insert(alertEvents).values({
      userId,
      eventType: 'manual',
      source: 'manual',
      occurredAt: new Date(),
      deliveryStatus: 'pending',
    }).returning();

    // Fire and forget dispatch
    dispatchAlert(newEvent.id, userId).catch(console.error);

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const soundAlertSchema = z.object({
  eventType: z.enum(['smoke_alarm', 'glass_break', 'distress', 'loud_impact']),
  confidence: z.number().min(0).max(1),
  occurredAt: z.string().datetime(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
});

router.post('/sound', alertLimiter, async (req: Request, res: Response) => {
  try {
    const data = soundAlertSchema.parse(req.body);
    const userId = req.session.userId!;

    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    const cooldownSeconds = settings?.cooldownSeconds ?? 300;

    const [lastEvent] = await db.select().from(alertEvents)
      .where(and(eq(alertEvents.userId, userId), eq(alertEvents.eventType, data.eventType)))
      .orderBy(desc(alertEvents.occurredAt))
      .limit(1);

    if (lastEvent) {
      const secondsSinceLast = (new Date().getTime() - lastEvent.occurredAt.getTime()) / 1000;
      if (secondsSinceLast < cooldownSeconds) {
        return res.status(429).json({ error: 'Cooldown active for this event type.' });
      }
    }

    const [newEvent] = await db.insert(alertEvents).values({
      userId,
      eventType: data.eventType,
      source: 'sound',
      confidence: data.confidence,
      occurredAt: new Date(data.occurredAt),
      locationLat: data.locationLat,
      locationLng: data.locationLng,
      deliveryStatus: 'pending',
    }).returning();

    dispatchAlert(newEvent.id, userId).catch(console.error);

    res.status(201).json(newEvent);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/test', async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    
    const [newEvent] = await db.insert(alertEvents).values({
      userId,
      eventType: 'test',
      source: 'test',
      occurredAt: new Date(),
      deliveryStatus: 'pending',
    }).returning();

    dispatchAlert(newEvent.id, userId, true).catch(console.error);

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await db.select().from(alertEvents)
      .where(eq(alertEvents.userId, req.session.userId!))
      .orderBy(desc(alertEvents.occurredAt))
      .limit(50);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
