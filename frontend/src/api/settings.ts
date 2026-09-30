import { apiFetch } from './client';
import { UserSettings } from '../types';

export const getSettings = () => apiFetch<UserSettings>('/api/settings');
export const updateSettings = (data: Partial<UserSettings>) => apiFetch<UserSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(data) });