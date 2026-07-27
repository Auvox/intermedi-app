import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors } from '@/constants/theme';

export function CopyrightFooter() {
  const year = new Date().getFullYear();

  return (
    <AppText variant="caption" color={Colors.textMuted} style={styles.text}>
      © {year} Intermedi
    </AppText>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
});
