import { pgTable, uuid, text, timestamp, boolean, jsonb, real, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const alertContacts = pgTable('alert_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  enabledEvents: jsonb('enabled_events').default(['smoke_alarm', 'glass_break', 'distress']).notNull(),
  thresholds: jsonb('thresholds').default({ smoke_alarm: 0.7, glass_break: 0.7, distress: 0.7, loud_impact: 0.8 }).notNull(),
  cooldownSeconds: integer('cooldown_seconds').default(300).notNull(),
  locationSharing: boolean('location_sharing').default(false).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const alertEvents = pgTable('alert_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  eventType: text('event_type').notNull(), // 'smoke_alarm'|'glass_break'|'distress'|'loud_impact'|'manual'|'test'
  source: text('source').notNull(), // 'manual'|'sound'|'test'
  confidence: real('confidence'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  deliveryStatus: text('delivery_status').default('pending').notNull(), // 'pending'|'sent'|'failed'
  providerMessageId: text('provider_message_id'),
  errorSummary: text('error_summary'),
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
