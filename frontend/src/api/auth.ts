import { apiFetch } from './client';
import { User } from '../types';

export const login = (data: any) => apiFetch<{user: User}>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const register = (data: any) => apiFetch<{user: User}>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const logout = () => apiFetch('/api/auth/logout', { method: 'POST' });
export const getMe = () => apiFetch<{user: User}>('/api/auth/me');