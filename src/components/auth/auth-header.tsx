import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { CrossPatternBackground } from '@/components/ui/cross-pattern-background';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type AuthHeaderProps = {
  title: string;
  showBack?: boolean;
  compact?: boolean;
};

export function AuthHeader({ title, showBack = false, compact = false }: AuthHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      <CrossPatternBackground />
      {compact ? (
        <View style={styles.compactRow}>
          <View style={styles.compactSlot}>{showBack && <BackButton tone="light" />}</View>
          <AppText variant="h2" color={Colors.textOnPrimary} style={styles.compactTitle}>{title}</AppText>
          <View style={styles.compactSlot} />
        </View>
      ) : <>
      <View style={styles.backSlot}>{showBack && <BackButton tone="light" />}</View>
      <AppText variant="h1" color={Colors.textOnPrimary} style={styles.title}>
        {title}
      </AppText>
      </>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    overflow: 'hidden',
  },
  backSlot: {
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  compactSlot: { width: 40 },
  compactTitle: { flex: 1, textAlign: 'center', fontSize: 24, lineHeight: 30 },
});
