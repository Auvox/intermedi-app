import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'solidLight' | 'outlineLight';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
};

export function Button({
  title,
  variant = 'solid',
  loading = false,
  fullWidth = true,
  compact = false,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const textColor: Record<ButtonVariant, string> = {
    solid: colors.textOnPrimary, outline: colors.primaryDark, ghost: colors.primaryDark,
    solidLight: colors.primary, outlineLight: colors.textOnPrimary,
  };
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        variant === 'solid' && styles.solid,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        variant === 'solidLight' && styles.solidLight,
        variant === 'outlineLight' && styles.outlineLight,
        variant === 'solid' && { backgroundColor: colors.primary },
        variant === 'outline' && { borderColor: colors.primaryDark },
        fullWidth && styles.fullWidth,
        compact && styles.compact,
        state.pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={textColor[variant]} />
      ) : (
        <AppText variant="button" color={textColor[variant]} style={compact ? styles.compactText : undefined}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}


const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    minHeight: 48,
  },
  compact: { minHeight: 44, paddingVertical: 10, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  compactText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  fullWidth: {
    alignSelf: 'stretch',
  },
  solid: {
    backgroundColor: Colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.sm,
  },
  solidLight: {
    backgroundColor: Colors.textOnPrimary,
  },
  outlineLight: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.textOnPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
