import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';

export function CopyrightFooter() {
  const year = new Date().getFullYear();
  const { colors } = useTheme();

  return (
    <AppText variant="caption" color={colors.textMuted} style={styles.text}>
      © {year} Intermedi
    </AppText>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
});
