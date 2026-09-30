import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import * as authApi from '../api/auth';
import { clearCsrfToken } from '../api/client';

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    authApi.getMe()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setUser, setLoading]);

  const login = async (data: any) => {
    const res = await authApi.login(data);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    setUser(res.user);
  };

  const logout = async () => {
    await authApi.logout();
    clearCsrfToken();
    setUser(null);
  };

  return { user, isLoading, login, register, logout };
}