import { apiFetch } from './client';
import { AlertContact } from '../types';

export const getContact = () => apiFetch<AlertContact | null>('/api/contacts');
export const upsertContact = (data: { name: string; email: string; enabled?: boolean }) =>
  apiFetch<AlertContact>('/api/contacts', { method: 'PUT', body: JSON.stringify(data) });