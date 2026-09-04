import { Platform } from 'react-native';

export const API_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://192.168.1.3:3000',
  default: 'http://localhost:3000',
}) as string;

export function getApiAssetUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file:')) {
    return path;
  }

  return `${API_URL}${path}`;
}
