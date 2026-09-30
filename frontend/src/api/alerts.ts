import { apiFetch } from './client';
import { AlertEvent } from '../types';

export const getAlerts = () => apiFetch<AlertEvent[]>('/api/alerts');
export const sendManualAlert = () => apiFetch<AlertEvent>('/api/alerts/manual', { method: 'POST', body: '{}' });
export const sendSoundAlert = (data: { eventType: string; confidence: number; occurredAt: string; locationLat?: number; locationLng?: number }) =>
  apiFetch<AlertEvent>('/api/alerts/sound', { method: 'POST', body: JSON.stringify(data) });
export const sendTestAlert = () => apiFetch<AlertEvent>('/api/alerts/test', { method: 'POST', body: '{}' });