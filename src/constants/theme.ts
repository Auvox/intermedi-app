import '@/global.css';

import { Platform, type TextStyle } from 'react-native';

// Paleta do design "Intermedi - Telas do app": verde institucional, fundo gelo
// e tons suaves (laranja, azul, roxo, âmbar, vermelho) para ícones e etiquetas.
export const Colors = {
  primary: '#0E6B50',
  primaryDark: '#0E6B50',
  primaryDarker: '#0A5640',
  primarySoft: '#E3F4EA',
  primaryBorder: '#BFE3CF',
  primaryBright: '#1E9E6A',
  primaryLight: '#8FE0B5',

  header: '#0E6B50',
  background: '#F5F7F6',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F3F1',

  text: '#0D231C',
  textSecondary: '#55625D',
  textMuted: '#7A8782',
  textOnPrimary: '#FFFFFF',

  border: '#E3E8E5',

  warning: '#F4A427',
  warningSoft: '#FFF1DC',
  warningText: '#8A5A12',

  danger: '#C8343F',
  dangerSoft: '#FCE8EA',

  orange: '#D0602E',
  orangeSoft: '#FDEEE7',
  blue: '#2F5BD3',
  blueSoft: '#E9EFFB',
  purple: '#7653D6',
  purpleSoft: '#F1EDFC',

  star: '#FBBF24',
  heart: '#E0533D',

  overlay: 'rgba(8,30,22,0.45)',
} as const;

export const DarkColors = {
  primary: '#1E9E6A',
  primaryDark: '#6FD3A4',
  primaryDarker: '#A3EBC9',
  primarySoft: '#173A2D',
  primaryBorder: '#25563F',
  primaryBright: '#2DB57D',
  primaryLight: '#8FE0B5',

  header: '#0B4D3A',
  background: '#0E1311',
  surface: '#171D1A',
  surfaceMuted: '#202724',

  text: '#F1F4F2',
  textSecondary: '#AEB9B3',
  textMuted: '#8E9A94',
  textOnPrimary: '#FFFFFF',

  border: '#2A332F',

  warning: '#F4A427',
  warningSoft: '#3D3016',
  warningText: '#F5C676',

  danger: '#F07C84',
  dangerSoft: '#3E1F23',

  orange: '#F08A5B',
  orangeSoft: '#3A251C',
  blue: '#8BA6F5',
  blueSoft: '#1D2640',
  purple: '#B19BF2',
  purpleSoft: '#2A2340',

  star: '#FBBF24',
  heart: '#F07560',

  overlay: 'rgba(0,0,0,0.60)',
} as const;

export type ThemeColors = { [Key in keyof typeof Colors]: string };

// Tons usados em ícones, etiquetas e cartões coloridos.
export type Tone = 'green' | 'orange' | 'blue' | 'purple' | 'red' | 'amber' | 'neutral';
export function toneColors(colors: ThemeColors, tone: Tone) {
  switch (tone) {
    case 'green': return { bg: colors.primarySoft, fg: colors.primaryDark };
    case 'orange': return { bg: colors.orangeSoft, fg: colors.orange };
    case 'blue': return { bg: colors.blueSoft, fg: colors.blue };
    case 'purple': return { bg: colors.purpleSoft, fg: colors.purple };
    case 'red': return { bg: colors.dangerSoft, fg: colors.danger };
    case 'amber': return { bg: colors.warningSoft, fg: colors.warningText };
    default: return { bg: colors.surfaceMuted, fg: colors.textSecondary };
  }
}

// Família Poppins (carregada no layout raiz) por peso.
export const FontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;
export function fontForWeight(weight?: string | number) {
  const value = Number(weight === 'bold' ? 700 : weight === 'normal' || weight == null ? 400 : weight);
  return value >= 700 ? FontFamily.bold : value >= 600 ? FontFamily.semibold : value >= 500 ? FontFamily.medium : FontFamily.regular;
}

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
  xl: 20,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
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
  xxxl: 34,
} as const;

export const Shadow = { boxShadow: '0 4px 18px rgba(13,35,28,0.07)' } as const;

export const MaxContentWidth = 480;

// Remove o contorno de foco padrão do navegador nos campos (a borda do campo já indica o foco).
export const NoOutline = { outlineStyle: 'none' } as unknown as TextStyle;
