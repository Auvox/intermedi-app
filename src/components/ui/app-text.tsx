import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, FontSize } from '@/constants/theme';

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

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  return <Text style={[styles[variant], color ? { color } : null, style]} {...rest} />;
}

const styles = StyleSheet.create({
  h1: {
    fontSize: FontSize.xxxl,
    lineHeight: 42,
    fontWeight: '800',
    color: Colors.text,
  },
  h2: {
    fontSize: FontSize.xxl,
    lineHeight: 34,
    fontWeight: '800',
    color: Colors.text,
  },
  h3: {
    fontSize: FontSize.lg,
    lineHeight: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  body: {
    fontSize: FontSize.md,
    lineHeight: 22,
    fontWeight: '400',
    color: Colors.text,
  },
  bodyBold: {
    fontSize: FontSize.md,
    lineHeight: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  label: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  button: {
    fontSize: FontSize.md,
    lineHeight: 20,
    fontWeight: '800',
    color: Colors.textOnPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: FontSize.xs,
    lineHeight: 16,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  link: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontWeight: '600',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
