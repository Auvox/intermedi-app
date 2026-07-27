import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Wordmark } from '@/components/ui/brand-mark';
import { Colors, Spacing } from '@/constants/theme';

export type AppHeaderProps = {
  address?: string;
};

export function AppHeader({ address }: AppHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.left}>
        <Wordmark height={22} />
        {address && (
          <Pressable
            style={styles.addressButton}
            onPress={() => router.push('/endereco-picker')}
            accessibilityRole="button">
            <AppText variant="label" numberOfLines={1} style={styles.addressText}>
              {address}
            </AppText>
            <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="Buscar">
          <Ionicons name="search" size={22} color={Colors.primary} />
        </Pressable>
        <Pressable
          hitSlop={8}
          style={styles.bellButton}
          accessibilityRole="button"
          accessibilityLabel="Notificações">
          <Ionicons name="notifications" size={22} color={Colors.primary} />
          <View style={styles.badge} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceMuted,
    backgroundColor: Colors.surface,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexShrink: 1,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
  },
  addressText: {
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  bellButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
});
