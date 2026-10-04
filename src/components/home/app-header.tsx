import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { AppText } from '@/components/ui/app-text';
import { Wordmark } from '@/components/ui/brand-mark';
import { useTheme } from '@/context/theme-context';
import { useUser } from '@/context/user-context';
import { formatUserAddress } from '@/utils/user-address';
import { Colors, Spacing, Radius } from '@/constants/theme';


export type AppHeaderProps = {
  address?: string;
};

export function AppHeader({ address }: AppHeaderProps) {
  const { user } = useUser();
  const displayedAddress = address ?? (formatUserAddress(user) || 'Endereço não cadastrado');
  const fullAddress = address ?? (formatUserAddress(user, true) || 'Endereço não cadastrado');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
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
          onPress={() => setSearchModalVisible(true)}
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
      <Modal
        transparent
        visible={searchModalVisible}
        animationType="fade"
        onRequestClose={() => setSearchModalVisible(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={() => setSearchModalVisible(false)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.surface }]} onPress={() => { }}>
            <AppText variant="h3" style={styles.modalTitle}>
              O que você deseja buscar?
            </AppText>

            <Pressable
              style={styles.optionButton}
              onPress={() => setSearchModalVisible(false)}>
              <AppText variant="body">Medicamento</AppText>
            </Pressable>

            <Pressable
              style={styles.optionButton}
              onPress={() => setSearchModalVisible(false)}>
              <AppText variant="body">Farmácia</AppText>
            </Pressable>

          </Pressable>
        </Pressable>
      </Modal>
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
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modal: {
    padding: Spacing.xl,
    gap: Spacing.md,
    borderRadius: Radius.lg,
  },
  modalTitle: {
    textAlign: 'center',
  },
  optionButton: {
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
});
