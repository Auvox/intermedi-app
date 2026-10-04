import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { FontSize } from '@/constants/theme';

export type AppTextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyBold'
  | 'label'
  | 'button'
  | 'caption'
  | 'link';

export type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: string;
};

export function AppText({ variant = 'body', color, style, numberOfLines, ...rest }: AppTextProps) {
  const { colors, textScale } = useTheme();
  const resolved = StyleSheet.flatten([styles[variant], style]);
  const defaultColor =
    variant === 'label' || variant === 'caption'
      ? colors.textMuted
      : variant === 'button'
        ? colors.textOnPrimary
        : variant === 'link'
          ? colors.primary
          : colors.text;

  return <Text {...rest} numberOfLines={textScale > 1 ? undefined : numberOfLines} style={[styles[variant], { color: color ?? defaultColor }, style, {
    fontSize: (resolved.fontSize ?? FontSize.md) * textScale,
    lineHeight: (resolved.lineHeight ?? (resolved.fontSize ?? FontSize.md) * 1.4) * textScale,
  }]} />;
}

const styles = StyleSheet.create({
  h1: {
    fontSize: FontSize.xxxl,
    lineHeight: 42,
    fontWeight: '800',
  },
  h2: {
    fontSize: FontSize.xxl,
    lineHeight: 34,
    fontWeight: '800',
  },
  h3: {
    fontSize: FontSize.lg,
    lineHeight: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: FontSize.md,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyBold: {
    fontSize: FontSize.md,
    lineHeight: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontWeight: '400',
  },
  button: {
    fontSize: FontSize.md,
    lineHeight: 20,
    fontWeight: '800',
    textTransform: 'none',
    letterSpacing: 0,
  },
  caption: {
    fontSize: FontSize.xs,
    lineHeight: 16,
    fontWeight: '400',
  },
  link: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
