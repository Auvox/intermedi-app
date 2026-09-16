import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Expo local acompanha o computador do Metro. Builds usam EXPO_PUBLIC_API_URL.
const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
const browserHost = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.hostname : undefined;
const host = browserHost || metroHost || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || `http://${host}:3000`).replace(/\/+$/, '');

export function getApiAssetUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file:')) {
    return path;
  }

  return `${API_URL}${path}`;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(data.message || data.error || 'Não foi possível concluir a operação.', response.status);
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.');
  } finally { clearTimeout(timeout); }
}
