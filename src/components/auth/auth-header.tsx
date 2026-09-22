import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { Wordmark } from '@/components/ui/brand-mark';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export type AuthHeaderProps = {
  title: string;
  showBack?: boolean;
};

export function AuthHeader({ title, showBack = false }: AuthHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.topRow}>
        <View style={styles.backSlot}>{showBack && <BackButton tone="dark" />}</View>
        <Wordmark height={43} />
        <View style={styles.backSlot} />
      </View>
      <AppText color={colors.text} style={styles.title}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3FFF8',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backSlot: {
    height: 40,
    width: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    marginTop: Spacing.xxl,
  },
});
