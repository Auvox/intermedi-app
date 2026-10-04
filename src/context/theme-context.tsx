import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, DarkColors } from '@/constants/theme';
export const TextSizes = { standard: 1, large: 1.2, extraLarge: 1.4 } as const;
export type TextSize = keyof typeof TextSizes;
type ThemeColors = { [Key in keyof typeof Colors]: string };
type ThemeContextData = {
  colors: ThemeColors; isDark: boolean; setIsDark: (value: boolean) => void;
  highContrast: boolean; setHighContrast: (value: boolean) => void;
  textSize: TextSize; setTextSize: (value: TextSize) => void; textScale: number;
};
const ThemeContext = createContext<ThemeContextData | undefined>(undefined);
const STORAGE_KEY = 'intermedi:appearance';
let pendingSave: Promise<void> = Promise.resolve();
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>('standard');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (!active || !saved) return;
      const p = JSON.parse(saved);
      if (typeof p?.isDark === 'boolean') setIsDark(p.isDark);
      if (typeof p?.highContrast === 'boolean') setHighContrast(p.highContrast);
      if (p?.textSize === 'standard' || p?.textSize === 'large' || p?.textSize === 'extraLarge') setTextSize(p.textSize);
    }).catch(error => console.warn('Não foi possível carregar as preferências.', error))
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    pendingSave = pendingSave.then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ isDark, highContrast, textSize })))
      .catch(error => console.warn('Não foi possível salvar as preferências.', error));
  }, [ready, isDark, highContrast, textSize]);
  const colors = useMemo<ThemeColors>(() => {
    const base = isDark ? DarkColors : Colors;
    if (!highContrast) return base;
    return { ...base,
      background: isDark ? '#000000' : '#FFFFFF', surface: isDark ? '#000000' : '#FFFFFF',
      surfaceMuted: isDark ? '#171717' : '#F0F0F0', text: isDark ? '#FFFFFF' : '#000000',
      textSecondary: isDark ? '#FFFFFF' : '#242424', textMuted: isDark ? '#E6E6E6' : '#333333',
      border: isDark ? '#FFFFFF' : '#333333', primary: '#006B3B',
      primaryDark: isDark ? '#83F5B7' : '#00552F', primaryDarker: isDark ? '#83F5B7' : '#004326',
      primaryBorder: isDark ? '#83F5B7' : '#006B3B', danger: isDark ? '#FF9D9D' : '#B91C1C' };
  }, [isDark, highContrast]);
  const value = useMemo(() => ({ colors, isDark, setIsDark, highContrast, setHighContrast, textSize, setTextSize, textScale: TextSizes[textSize] }), [colors, isDark, highContrast, textSize]);
  const navigationTheme = useMemo(() => ({
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  }), [isDark, colors]);
  return <ThemeContext.Provider value={value}>
    {ready ? <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider> : <LoadingScreen />}
  </ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  return context;
}
