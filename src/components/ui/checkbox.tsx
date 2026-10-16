import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { Spacing } from '@/constants/theme';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  accessibilityLabel?: string;
};

export function CheckboxBox({ checked }: { checked: boolean }) {
  const { colors } = useTheme();
  return <View style={[styles.box, checked ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.textMuted }]}>
    {checked && <Ionicons name="checkmark" size={17} color="#FFFFFF" />}
  </View>;
}

export function Checkbox({ checked, onChange, label, accessibilityLabel }: CheckboxProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={styles.row}
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked }}
      hitSlop={8}>
      <CheckboxBox checked={checked} />
      {label ? <AppText variant="label" color={colors.textSecondary}>
        {label}
      </AppText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.8, alignItems: 'center', justifyContent: 'center' },
});
