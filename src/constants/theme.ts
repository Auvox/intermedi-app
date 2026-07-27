import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  primary: '#12B76A',
  primaryDark: '#0C8F53',
  primaryDarker: '#096D40',
  primarySoft: '#E7F8EF',
  primaryBorder: '#BEEBD3',

  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F6F8',

  text: '#1A1D1F',
  textSecondary: '#6B7280',
  textMuted: '#9AA1AB',
  textOnPrimary: '#FFFFFF',

  border: '#E7E9EC',

  warning: '#F5A524',
  warningSoft: '#FEF3D6',
  danger: '#EF4444',

  star: '#FBBF24',
  overlay: 'rgba(0,0,0,0.35)',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
} as const;

export const MaxContentWidth = 480;
