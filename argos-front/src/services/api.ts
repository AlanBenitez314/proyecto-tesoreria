// src/services/api.ts
import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

/** Opcional: setear/eliminar token manualmente (login/logout) */
export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('access', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('access');
    delete api.defaults.headers.common['Authorization'];
  }
}

/** --- Request interceptor: agrega Authorization en cada request --- */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access');
  if (token) {
    // En Axios 1.x, headers es AxiosHeaders y tiene .set(...)
    if (config.headers && typeof (config.headers as any).set === 'function') {
      (config.headers as any).set('Authorization', `Bearer ${token}`);
    } else {
      // fallback por si alguna lib mutó headers a objeto plano
      (config.headers as any) = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }
  }
  return config; // <- devuelve InternalAxiosRequestConfig
});

/** --- Refresh control --- */
let refreshing = false;
let queue: Array<() => void> = [];

async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem('refresh');
  if (!refresh) throw new Error('No refresh token');

  // Usamos axios "crudo" para evitar interceptores y loops
  const r = await axios.post<{ access: string }>(
    '/api/auth/refresh/',
    { refresh },
    { baseURL: '/api' }
  );
  const newAccess = r.data.access;
  localStorage.setItem('access', newAccess);
  api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
  return newAccess;
}

/** --- Response interceptor: intenta refresh si hay 401 y reintenta --- */
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    // el .config de Axios 1.x no está fuertemente tipado; lo extendemos
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (status === 401 && original && !original._retry) {
      original._retry = true;

      if (!refreshing) {
        refreshing = true;
        try {
          const newAccess = await refreshAccessToken();
          refreshing = false;

          queue.forEach((cb) => cb());
          queue = [];

          if (original.headers && typeof (original.headers as any).set === 'function') {
            (original.headers as any).set('Authorization', `Bearer ${newAccess}`);
          } else {
            (original.headers as any) = { ...(original.headers || {}), Authorization: `Bearer ${newAccess}` };
          }
          return api.request(original);
        } catch (e) {
          refreshing = false;
          queue = [];
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          delete api.defaults.headers.common['Authorization'];
          window.location.reload();
          return Promise.reject(e);
        }
      } else {
        // Ya hay refresh en curso: esperar y reintentar
        return new Promise((resolve) => {
          queue.push(async () => {
            const token = localStorage.getItem('access');
            if (token && original) {
              if (original.headers && typeof (original.headers as any).set === 'function') {
                (original.headers as any).set('Authorization', `Bearer ${token}`);
              } else {
                (original.headers as any) = { ...(original.headers || {}), Authorization: `Bearer ${token}` };
              }
            }
            resolve(api.request(original!));
          });
        });
      }
    }

    return Promise.reject(error);
  }
);
