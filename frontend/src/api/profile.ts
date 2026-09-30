import { apiFetch } from './client';
import { User } from '../types';

export const getProfile = () => apiFetch<{ id: string; name: string; email: string }>('/api/profile');
export const updateProfile = (data: { name: string }) =>
  apiFetch<User>('/api/profile', { method: 'PUT', body: JSON.stringify(data) });
