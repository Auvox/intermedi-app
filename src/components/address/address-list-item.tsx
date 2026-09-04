import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
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
  const { colors } = useTheme();
  return (
    <Pressable
      style={[styles.row, { borderColor: selected ? colors.primary : colors.border, backgroundColor: colors.surface }, selected && styles.rowSelected]}
      onPress={onPress}
      accessibilityRole="button">
      <Ionicons name={icon} size={22} color={colors.text} />

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
        <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} style={styles.menuIcon} />
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
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  rowSelected: {
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
