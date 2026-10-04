import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { AppText } from '@/components/ui/app-text';
import { Radius, Spacing } from '@/constants/theme';

export type ProfileMenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  showWarning?: boolean;
  showThemeSwitch?: boolean;
  onPress?: () => void;
};


export function ProfileMenuItem({ icon, title, subtitle, showWarning, showThemeSwitch, onPress }: ProfileMenuItemProps) {
  const { colors, isDark, setIsDark } = useTheme();
  return (
    <Pressable
      style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceMuted }]}>
        <Ionicons
          name={icon}
          size={20}
          color={colors.primaryDark}
        />
      </View>

      <View style={styles.info}>
        <AppText variant="bodyBold">{title}</AppText>

        {subtitle && (
          <AppText variant="label">
            {subtitle}
          </AppText>
        )}
      </View>

      {showThemeSwitch && (
        <Switch
          accessibilityLabel="Modo escuro"
          value={isDark}
          onValueChange={setIsDark}
          trackColor={{ false: colors.border, true: colors.primaryBorder }}
          thumbColor={isDark ? colors.primary : colors.textMuted}
        />
      )}

      {showWarning && (
        <Ionicons
          name="warning"
          size={18}
          color={colors.warning}
        />
      )}

      {!showThemeSwitch && (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderRadius: 22,
    minHeight: 76,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
