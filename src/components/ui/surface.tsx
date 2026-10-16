import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { useTheme } from '@/context/theme-context';
import { FontFamily, Radius, Shadow, Spacing, toneColors, type Tone } from '@/constants/theme';

// Peças visuais compartilhadas pelas telas do novo design.

export function Card({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  const { colors } = useTheme();
  const base = [styles.card, { backgroundColor: colors.surface }, Shadow, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [base, pressed && styles.pressed]}>{children}</Pressable>;
}

export function Tag({ label, tone = 'green', dot = false, style }: { label: string; tone?: Tone; dot?: boolean; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const { bg, fg } = toneColors(colors, tone);
  return <View style={[styles.tag, { backgroundColor: bg }, style]}>
    {dot && <View style={[styles.dot, { backgroundColor: fg }]} />}
    <AppText variant="caption" color={fg} style={styles.tagText}>{label}</AppText>
  </View>;
}

export function IconTile({ icon, tone = 'green', size = 48, iconSize, children }: { icon?: keyof typeof Ionicons.glyphMap; tone?: Tone; size?: number; iconSize?: number; children?: ReactNode }) {
  const { colors } = useTheme();
  const { bg, fg } = toneColors(colors, tone);
  return <View style={[styles.tile, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg }]}>
    {children ?? (icon ? <Ionicons name={icon} size={iconSize ?? size * 0.46} color={fg} /> : null)}
  </View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { colors } = useTheme();
  return <View style={styles.section}>
    <AppText variant="h3" style={styles.sectionTitle}>{title}</AppText>
    {action && onAction ? <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8} style={styles.sectionAction}>
      <AppText variant="label" color={colors.primaryDark} style={styles.semibold}>{action}</AppText>
    </Pressable> : null}
  </View>;
}

// Linha de lista com ícone, título, subtítulo e um elemento à direita.
export function ListRow({ icon, tone = 'green', title, subtitle, right, onPress, divider = false, leading }: {
  icon?: keyof typeof Ionicons.glyphMap; tone?: Tone; title: string; subtitle?: string; right?: ReactNode; onPress?: () => void; divider?: boolean; leading?: ReactNode;
}) {
  const { colors } = useTheme();
  const content = <>
    {leading ?? (icon ? <IconTile icon={icon} tone={tone} size={44} /> : null)}
    <View style={styles.rowText}>
      <AppText variant="bodyBold" numberOfLines={2}>{title}</AppText>
      {!!subtitle && <AppText variant="label" numberOfLines={2}>{subtitle}</AppText>}
    </View>
    {right ?? (onPress ? <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} /> : null)}
  </>;
  const style = [styles.row, divider && { borderTopWidth: 1, borderTopColor: colors.border }];
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [style, pressed && styles.pressed]}>{content}</Pressable> : <View style={style}>{content}</View>;
}

export function EmptyState({ icon, title, text, children }: { icon: keyof typeof Ionicons.glyphMap; title: string; text?: string; children?: ReactNode }) {
  return <Card style={styles.empty}>
    <IconTile icon={icon} size={56} />
    <AppText variant="bodyBold" style={styles.center}>{title}</AppText>
    {!!text && <AppText variant="label" style={styles.center}>{text}</AppText>}
    {children}
  </Card>;
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.xl, padding: Spacing.lg },
  pressed: { opacity: 0.85 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontFamily: FontFamily.medium },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tile: { alignItems: 'center', justifyContent: 'center' },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  sectionTitle: { flexShrink: 1 },
  sectionAction: { minHeight: 36, justifyContent: 'center' },
  semibold: { fontFamily: FontFamily.semibold },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, minHeight: 64 },
  rowText: { flex: 1, minWidth: 0 },
  empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  center: { textAlign: 'center' },
});
