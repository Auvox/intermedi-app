import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { Colors, DarkColors } from '@/constants/theme';

type ThemeColors = {
  [Key in keyof typeof Colors]: string;
};

type ThemeContextData = {
  colors: ThemeColors;
  isDark: boolean;
  setIsDark: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The app always starts in light mode. The user can opt into dark mode.
  const [isDark, setIsDark] = useState(false);
  const colors: ThemeColors = isDark ? DarkColors : Colors;

  const value = useMemo(
    () => ({ colors, isDark, setIsDark }),
    [colors, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }

  return context;
}
