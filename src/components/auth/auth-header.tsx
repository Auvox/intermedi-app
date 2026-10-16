import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { Mascot, type MascotId } from '@/components/ui/mascot';
import { HeaderDecor } from '@/components/ui/screen-header';
import { useTheme } from '@/context/theme-context';

export const REGISTER_STEPS = 4;

export function StepProgress({ step }: { step: number }) {
  return <View style={styles.progressRow} accessibilityLabel={`Etapa ${step} de ${REGISTER_STEPS}`}>
    <View style={styles.track}><View style={[styles.fill, { width: `${(step / REGISTER_STEPS) * 100}%` }]} /></View>
    <AppText variant="label" color="rgba(255,255,255,0.85)">{step} de {REGISTER_STEPS}</AppText>
  </View>;
}

export type AuthHeaderProps = { title: string; step: number; mascot?: MascotId; onBack?: () => void; children?: ReactNode };

// Cabeçalho do cadastro: progresso das etapas e o mascote "falando" a pergunta.
export function AuthHeader({ title, step, mascot = 'broto', onBack }: AuthHeaderProps) {
  const insets = useSafeAreaInsets(); const { colors } = useTheme();
  return <View style={[styles.header, { backgroundColor: colors.header, paddingTop: insets.top + 16 }]}>
    <HeaderDecor size={320} cross={false} />
    <View style={styles.topRow}><BackButton onPress={onBack} /><StepProgress step={step} /></View>
    <View style={styles.speech}>
      <View style={styles.mascot}><Mascot id={mascot} size={112} shadow={false} /></View>
      <View style={[styles.bubble, { backgroundColor: colors.surface }]}>
        <View style={[styles.tail, { backgroundColor: colors.surface }]} />
        <AppText variant="h3" style={styles.title}>{title}</AppText>
      </View>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden', gap: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  progressRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: '#8FE0B5' },
  speech: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: -6 },
  mascot: { height: 96, overflow: 'hidden', justifyContent: 'flex-start' },
  bubble: { flex: 1, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 14, marginBottom: 26 },
  tail: { position: 'absolute', left: -6, bottom: 18, width: 16, height: 16, transform: [{ rotate: '45deg' }], borderRadius: 3 },
  title: { fontSize: 19, lineHeight: 26 },
});
