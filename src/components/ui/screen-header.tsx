import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './app-text';
import { BackButton } from './back-button';
import { useTheme } from '@/context/theme-context';
import { Spacing } from '@/constants/theme';

// Círculo e cruz translúcidos do canto superior direito dos cabeçalhos verdes.
export function HeaderDecor({ size = 300, cross = true }: { size?: number; cross?: boolean }) {
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, right: -size * 0.32, top: -size * 0.42 }]} />
    {cross && <View style={styles.cross}>
      <View style={[styles.crossBar, { width: 56, height: 20, top: 18 }]} />
      <View style={[styles.crossBar, { width: 20, height: 56, left: 18 }]} />
    </View>}
  </View>;
}

export type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  // Conteúdo exibido ao lado do botão voltar no lugar do título (ex.: campo de busca).
  inline?: ReactNode;
  children?: ReactNode;
  // Espaço extra no fim para cartões que "sobem" sobre o cabeçalho.
  overlap?: number;
  large?: boolean;
  style?: ViewStyle;
};

export function ScreenHeader({ title, subtitle, back, onBack, right, inline, children, overlap = 0, large, style }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const showLargeTitle = large ?? !back;
  return <View style={[styles.header, { backgroundColor: colors.header, paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xl + overlap }, style]}>
    <HeaderDecor />
    {(back || right || inline || !showLargeTitle) && <View style={styles.row}>
      {back && <BackButton onPress={onBack} />}
      {inline ? <View style={styles.flex}>{inline}</View> : !showLargeTitle && title ? <View style={styles.flex}>
        <AppText variant="h3" color="#FFFFFF" style={styles.compactTitle} numberOfLines={2}>{title}</AppText>
        {!!subtitle && <AppText variant="label" color="rgba(255,255,255,0.85)">{subtitle}</AppText>}
      </View> : <View style={styles.flex} />}
      {right}
    </View>}
    {showLargeTitle && !!title && <View style={styles.titleBlock}>
      <AppText variant="h2" color="#FFFFFF">{title}</AppText>
      {!!subtitle && <AppText color="rgba(255,255,255,0.85)">{subtitle}</AppText>}
    </View>}
    {children}
  </View>;
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.xl, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: 'hidden', gap: Spacing.lg },
  circle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.07)' },
  cross: { position: 'absolute', right: 6, top: 82, width: 56, height: 56, opacity: 0.09 },
  crossBar: { position: 'absolute', backgroundColor: '#FFFFFF', borderRadius: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  flex: { flex: 1, minWidth: 0 },
  compactTitle: { fontSize: 22, lineHeight: 28 },
  titleBlock: { gap: 2 },
});
