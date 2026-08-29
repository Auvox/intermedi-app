import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { AppText } from '@/components/ui/app-text';
import { Wordmark } from '@/components/ui/brand-mark';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius } from '@/constants/theme';


export type AppHeaderProps = {
  address?: string;
};

export function AppHeader({ address }: AppHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md, borderBottomColor: colors.surfaceMuted, backgroundColor: colors.surface }]}>
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
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          hitSlop={8}
          onPress={() => setSearchModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Buscar">
          <Ionicons name="search" size={22} color={Colors.primary} />
        </Pressable>
        <Pressable
          hitSlop={8}
          style={styles.bellButton}
          onPress={() => router.push('/notificacoes')}
          accessibilityRole="button"
          accessibilityLabel="Notificações">
          <Ionicons name="notifications" size={22} color={Colors.primary} />
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
    paddingHorizontal: Spacing.xl,
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
