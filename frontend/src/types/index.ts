export type SoundEventType = 'smoke_alarm' | 'glass_break' | 'distress' | 'loud_impact' | 'manual' | 'test';
export type DeliveryStatus = 'pending' | 'sent' | 'failed';
export type AlertSource = 'manual' | 'sound' | 'test';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AlertContact {
  id: string;
  userId: string;
  name: string;
  email: string;
  enabled: boolean;
}

export interface UserSettings {
  enabledEvents: SoundEventType[];
  thresholds: Record<SoundEventType, number>;
  cooldownSeconds: number;
  locationSharing: boolean;
}

export interface AlertEvent {
  id: string;
  userId: string;
  eventType: SoundEventType;
  source: AlertSource;
  confidence?: number;
  occurredAt: string;
  deliveryStatus: DeliveryStatus;
  providerMessageId?: string;
  errorSummary?: string;
  locationLat?: number;
  locationLng?: number;
}

export type MonitoringStatus = 'idle' | 'requesting-permission' | 'loading-model' | 'active' | 'error' | 'unavailable';
