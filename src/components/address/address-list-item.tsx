import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type AddressListItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  address: string;
  selected?: boolean;
  showMenu?: boolean;
  onPress: () => void;
};

export function AddressListItem({
  icon,
  label,
  address,
  selected = false,
  showMenu = false,
  onPress,
}: AddressListItemProps) {
  return (
    <Pressable
      style={[styles.row, selected && styles.rowSelected]}
      onPress={onPress}
      accessibilityRole="button">
      <Ionicons name={icon} size={22} color={Colors.text} />

      <View style={styles.info}>
        <AppText variant="bodyBold" numberOfLines={1}>
          {label}
        </AppText>
        <AppText variant="label" numberOfLines={1}>
          {address}
        </AppText>
      </View>

      {selected && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
      {showMenu && (
        <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} style={styles.menuIcon} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  rowSelected: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  menuIcon: {
    marginLeft: Spacing.xs,
  },
});
