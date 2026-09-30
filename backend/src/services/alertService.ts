import { db } from '../db/index.js';
import { alertEvents, alertContacts, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { sendAlertEmail } from './email.js';

export async function dispatchAlert(
  eventId: string,
  userId: string,
  isTest: boolean = false
): Promise<void> {
  try {
    const [event] = await db.select().from(alertEvents).where(eq(alertEvents.id, eventId));
    if (!event) return;

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [contact] = await db.select().from(alertContacts).where(eq(alertContacts.userId, userId));

    if (!contact || !contact.enabled) {
      await db.update(alertEvents).set({
        deliveryStatus: 'failed',
        errorSummary: 'No trusted contact configured or enabled',
      }).where(eq(alertEvents.id, eventId));
      return;
    }

    const emailResult = await sendAlertEmail({
      toName: contact.name,
      toEmail: contact.email,
      fromEmail: process.env.ALERT_FROM_EMAIL || 'alerts@quietguard.test',
      userName: user.name,
      eventType: event.eventType,
      source: event.source,
      occurredAt: event.occurredAt,
      confidence: event.confidence !== null ? event.confidence : undefined,
      locationLat: event.locationLat !== null ? event.locationLat : undefined,
      locationLng: event.locationLng !== null ? event.locationLng : undefined,
      isTest,
    });

    if (emailResult.error) {
      await db.update(alertEvents).set({
        deliveryStatus: 'failed',
        errorSummary: emailResult.error,
      }).where(eq(alertEvents.id, eventId));
    } else {
      await db.update(alertEvents).set({
        deliveryStatus: 'sent',
        providerMessageId: emailResult.messageId,
      }).where(eq(alertEvents.id, eventId));
    }
  } catch (error: any) {
    console.error('Failed to dispatch alert:', error);
    try {
      await db.update(alertEvents).set({
        deliveryStatus: 'failed',
        errorSummary: error.message,
      }).where(eq(alertEvents.id, eventId));
    } catch (dbError) {
      console.error('Failed to update alert failure status:', dbError);
    }
  }
}
