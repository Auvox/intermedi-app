import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { CrossPatternBackground } from '@/components/ui/cross-pattern-background';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type AuthHeaderProps = {
  title: string;
  showBack?: boolean;
};

export function AuthHeader({ title, showBack = false }: AuthHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      <CrossPatternBackground />
      <View style={styles.backSlot}>{showBack && <BackButton tone="light" />}</View>
      <AppText variant="h1" color={Colors.textOnPrimary} style={styles.title}>
        {title}
      </AppText>
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
});
