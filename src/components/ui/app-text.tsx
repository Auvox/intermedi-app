import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { FontSize, fontForWeight } from '@/constants/theme';

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
  const resolved: TextStyle = StyleSheet.flatten([styles[variant], style]);
  const defaultColor =
    variant === 'label' || variant === 'caption'
      ? colors.textSecondary
      : variant === 'button'
        ? colors.textOnPrimary
        : variant === 'link'
          ? colors.primaryDark
          : colors.text;

  // Poppins tem um arquivo por peso: a família substitui o fontWeight.
  return <Text {...rest} numberOfLines={textScale > 1 ? undefined : numberOfLines} style={[styles[variant], { color: color ?? defaultColor }, style, {
    fontFamily: resolved.fontFamily ?? fontForWeight(resolved.fontWeight),
    fontWeight: 'normal',
    fontSize: (resolved.fontSize ?? FontSize.md) * textScale,
    lineHeight: (resolved.lineHeight ?? (resolved.fontSize ?? FontSize.md) * 1.45) * textScale,
  }]} />;
}

const styles = StyleSheet.create({
  h1: {
    fontSize: FontSize.xxxl,
    lineHeight: 42,
    fontWeight: '700',
  },
  h2: {
    fontSize: FontSize.xxl,
    lineHeight: 36,
    fontWeight: '700',
  },
  h3: {
    fontSize: FontSize.lg,
    lineHeight: 26,
    fontWeight: '700',
  },
  body: {
    fontSize: FontSize.md,
    lineHeight: 23,
    fontWeight: '400',
  },
  bodyBold: {
    fontSize: FontSize.md,
    lineHeight: 23,
    fontWeight: '700',
  },
  label: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontWeight: '400',
  },
  button: {
    fontSize: FontSize.md,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: 0,
  },
  caption: {
    fontSize: FontSize.xs,
    lineHeight: 17,
    fontWeight: '400',
  },
  link: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontWeight: '700',
  },
});
