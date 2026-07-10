import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.realvistaproperties.com';

console.log('[apiClient] BASE_URL =', BASE_URL);

const WS_BASE = (
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.realvistaproperties.com'
).replace(/^http/, 'ws');

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStore.get();
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never retry refresh endpoint itself or already-retried requests
    if (
      originalRequest?.url?.includes('/api/auth/refresh/') ||
      originalRequest?._retry
    ) {
      await tokenStore.clear();
      await tokenStore.clearRefresh();
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      console.log('[apiClient] 401 on:', error.config?.url);
      originalRequest._retry = true;

      const refreshToken = await tokenStore.getRefresh();
      if (!refreshToken) {
        // No refresh token — user needs to log in
        await tokenStore.clear();
        return Promise.reject(error);
      }

      try {
        const { data } = await api.post('/api/auth/refresh/', {
          refresh: refreshToken,
        });
        await tokenStore.set(data.access);
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch {
        await tokenStore.clear();
        await tokenStore.clearRefresh();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

export async function uploadFile(
  path: string,
  formData: FormData,
): Promise<any> {
  const token = await tokenStore.get();
  const response = await fetch(`${BASE_URL}/${path.replace(/^\//, '')}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  return response.json();
}
