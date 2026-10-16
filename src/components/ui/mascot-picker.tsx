import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './app-text';
import { MASCOTS, Mascot, MascotPill, type MascotId } from './mascot';
import { useTheme } from '@/context/theme-context';
import { FontFamily, Shadow } from '@/constants/theme';

// Cartão grande do mascote selecionado e os três botões de escolha.
export function MascotPicker({ value, onChange }: { value: MascotId; onChange: (id: MascotId) => void }) {
  const { colors } = useTheme();
  const m = MASCOTS[value];
  return <View style={styles.wrap}>
    <View style={[styles.card, { backgroundColor: colors.surface }, Shadow]}>
      <View style={[styles.stage, { backgroundColor: m.soft }]}>
        <View style={[styles.badge, { backgroundColor: colors.surface }]}><AppText variant="caption" color={colors.primaryDark} style={styles.bold}>Rotina e lembretes</AppText></View>
        <View style={[styles.halo, { backgroundColor: 'rgba(255,255,255,0.65)' }]} />
        <Mascot id={value} size={200} />
      </View>
      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <AppText variant="h2" style={styles.name}>{m.name}</AppText>
          <AppText variant="label" color={m.accent} style={styles.trait}>{m.trait}</AppText>
        </View>
        <AppText variant="label">{m.description}</AppText>
      </View>
    </View>
    <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Escolha seu mascote">
      {(Object.keys(MASCOTS) as MascotId[]).map(id => {
        const selected = id === value;
        return <Pressable key={id} accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={MASCOTS[id].name} onPress={() => onChange(id)}
          style={[styles.option, { backgroundColor: selected ? MASCOTS[id].soft : colors.surface, borderColor: selected ? MASCOTS[id].accent : 'transparent' }, Shadow]}>
          <MascotPill id={id} size={28} />
          <AppText variant="bodyBold">{MASCOTS[id].name}</AppText>
        </Pressable>;
      })}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  card: { borderRadius: 28, padding: 16, gap: 14 },
  stage: { height: 290, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  halo: { position: 'absolute', width: 230, height: 230, borderRadius: 115 },
  badge: { position: 'absolute', top: 14, left: 14, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5, zIndex: 1 },
  bold: { fontFamily: FontFamily.bold },
  copy: { paddingHorizontal: 6, gap: 4, paddingBottom: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' },
  name: { fontSize: 26 },
  trait: { fontFamily: FontFamily.semibold },
  options: { flexDirection: 'row', gap: 10 },
  option: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 64, borderRadius: 20, borderWidth: 2 },
});
