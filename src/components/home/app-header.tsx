import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/app-text';
import { Wordmark } from '@/components/ui/brand-mark';
import { useTheme } from '@/context/theme-context';
import { useUser } from '@/context/user-context';
import { formatUserAddress } from '@/utils/user-address';
import { Colors, Spacing } from '@/constants/theme';


export type AppHeaderProps = {
  address?: string;
};

export function AppHeader({ address }: AppHeaderProps) {
  const { user } = useUser();
  const displayedAddress = address ?? (formatUserAddress(user) || 'Endereço não cadastrado');
  const fullAddress = address ?? (formatUserAddress(user, true) || 'Endereço não cadastrado');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md, borderBottomColor: colors.surfaceMuted, backgroundColor: isDark ? '#103F2D' : '#146B58' }]}>
      <View style={styles.left}>
        <Wordmark height={32} variant="light" />
        {displayedAddress && (
          <Pressable
            style={styles.addressButton}
            onPress={() => router.push('/endereco-picker')}
            accessibilityRole="button"
            accessibilityLabel={`Endereço: ${fullAddress}. Ver endereços.`}>
            <Ionicons name="location" size={18} color="#FFFFFF" />
            <AppText color="#FFFFFF" variant="label" numberOfLines={1} style={styles.addressText}>
              {displayedAddress}
            </AppText>
            <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          hitSlop={8}
          onPress={() => { if (pathname !== '/pesquisa') router.push({ pathname: '/pesquisa', params: { origem: pathname === '/farmacias' ? 'farmacias' : pathname === '/buscar-medicamentos' ? 'remedios' : 'home' } }); }}
          accessibilityRole="button"
          accessibilityLabel="Buscar">
          <Ionicons name="search" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable
          hitSlop={8}
          style={styles.bellButton}
          onPress={() => router.push('/notificacoes')}
          accessibilityRole="button"
          accessibilityLabel="Notificações">
          <Ionicons name="notifications" size={22} color="#FFFFFF" />
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
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
