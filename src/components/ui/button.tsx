import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { Radius, Spacing } from '@/constants/theme';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'solidLight' | 'outlineLight' | 'danger' | 'soft' | 'warning';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
  icon?: ReactNode;
};

export function Button({
  title,
  variant = 'solid',
  loading = false,
  fullWidth = true,
  compact = false,
  icon,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    solid: { bg: colors.primary, fg: colors.textOnPrimary },
    outline: { bg: colors.surface, fg: colors.text, border: colors.border },
    ghost: { bg: 'transparent', fg: colors.primaryDark },
    solidLight: { bg: '#FFFFFF', fg: '#0E6B50' },
    outlineLight: { bg: 'transparent', fg: '#FFFFFF', border: 'rgba(255,255,255,0.6)' },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    soft: { bg: colors.primarySoft, fg: colors.primaryDark },
    warning: { bg: colors.warningSoft, fg: colors.warningText },
  };
  const { bg, fg, border } = palette[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        { backgroundColor: bg },
        border ? { borderWidth: 1.5, borderColor: border } : null,
        variant === 'ghost' && styles.ghost,
        fullWidth && styles.fullWidth,
        compact && styles.compact,
        state.pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon}
          <AppText variant="button" color={fg} style={compact ? styles.compactText : styles.text}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 18,
    minHeight: 58,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  text: { textAlign: 'center' },
  compact: { minHeight: 44, paddingVertical: 8, paddingHorizontal: Spacing.lg, borderRadius: Radius.md },
  compactText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  fullWidth: {
    alignSelf: 'stretch',
  },
  ghost: {
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
