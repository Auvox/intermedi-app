import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Tag } from '@/components/ui/surface';
import { FontFamily, Shadow, type Tone } from '@/constants/theme';
import { dayKey, useCare } from '@/context/care-context';
import { useTheme } from '@/context/theme-context';
import { useApiResource } from '@/hooks/use-api-resource';
import { listarMedicamentos } from '@/services/medicamentos';
import { medicineDetail, medicineTitle, requiresPrescription } from '@/utils/medicine-style';

type Side = 'frente' | 'costas';
type Region = { id: string; label: string; shapes: ViewStyle[]; sides: Side[]; match: RegExp };

// Partes do boneco (caixa de 160 x 300) e as palavras que ligam cada região aos remédios do banco.
const PAIN = /dor|analg|antiterm|febre|paracetamol|dipirona/;
const MUSCLE = /inflam|muscul|artic|contus|dor|analg/;
const REGIONS: Region[] = [
  { id: 'cabeca', label: 'Cabeça', sides: ['frente', 'costas'], match: /cefal|enxaq|cabeca|dor de cabeca|dor|analg|febre/, shapes: [{ left: 58, top: 2, width: 44, height: 50, borderRadius: 22 }] },
  { id: 'garganta', label: 'Garganta', sides: ['frente'], match: /garganta|gripe|resfri|tosse/, shapes: [{ left: 70, top: 54, width: 20, height: 12, borderRadius: 4 }] },
  { id: 'nuca', label: 'Nuca', sides: ['costas'], match: MUSCLE, shapes: [{ left: 70, top: 54, width: 20, height: 12, borderRadius: 4 }] },
  { id: 'peito', label: 'Peito', sides: ['frente'], match: /tosse|gripe|respir|expector|resfri/, shapes: [{ left: 50, top: 68, width: 60, height: 46, borderRadius: 10 }] },
  { id: 'costas', label: 'Costas', sides: ['costas'], match: MUSCLE, shapes: [{ left: 50, top: 68, width: 60, height: 46, borderRadius: 10 }] },
  { id: 'barriga', label: 'Barriga', sides: ['frente'], match: /estom|gastr|digest|intest|azia|antiac|colica|enjo|nause/, shapes: [{ left: 50, top: 116, width: 60, height: 40, borderRadius: 10 }] },
  { id: 'lombar', label: 'Lombar', sides: ['costas'], match: MUSCLE, shapes: [{ left: 50, top: 116, width: 60, height: 40, borderRadius: 10 }] },
  { id: 'bracos', label: 'Braços', sides: ['frente', 'costas'], match: MUSCLE, shapes: [{ left: 28, top: 70, width: 18, height: 84, borderRadius: 9 }, { left: 114, top: 70, width: 18, height: 84, borderRadius: 9 }] },
  { id: 'maos', label: 'Mãos', sides: ['frente', 'costas'], match: MUSCLE, shapes: [{ left: 27, top: 158, width: 20, height: 20, borderRadius: 10 }, { left: 113, top: 158, width: 20, height: 20, borderRadius: 10 }] },
  { id: 'pernas', label: 'Pernas', sides: ['frente', 'costas'], match: MUSCLE, shapes: [{ left: 52, top: 160, width: 26, height: 56, borderRadius: 10 }, { left: 82, top: 160, width: 26, height: 56, borderRadius: 10 }] },
  { id: 'joelhos', label: 'Joelhos', sides: ['frente'], match: MUSCLE, shapes: [{ left: 53, top: 218, width: 24, height: 24, borderRadius: 12 }, { left: 83, top: 218, width: 24, height: 24, borderRadius: 12 }] },
  { id: 'pes', label: 'Pés', sides: ['frente', 'costas'], match: MUSCLE, shapes: [{ left: 54, top: 246, width: 22, height: 50, borderRadius: 10 }, { left: 84, top: 246, width: 22, height: 50, borderRadius: 10 }] },
];
const TONES: Tone[] = ['orange', 'blue', 'purple', 'green'];
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function OndeDoiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const care = useCare();
  const catalog = useApiResource(listarMedicamentos);
  const today = care.pains.find(p => p.date === dayKey());
  const [side, setSide] = useState<Side>('frente');
  const [marked, setMarked] = useState<string[]>(today?.regions ?? []);
  const [saved, setSaved] = useState(false);
  const toggle = (id: string) => { setSaved(false); setMarked(list => list.includes(id) ? list.filter(r => r !== id) : [...list, id]); };

  // Sugere remédios sem exigência de receita cuja categoria/indicação combina com a região.
  const suggestions = useMemo(() => {
    const free = (catalog.data ?? []).filter(m => !requiresPrescription(m));
    const used = new Set<string>();
    return marked.flatMap(id => {
      const region = REGIONS.find(r => r.id === id); if (!region) return [];
      return free.filter(m => {
        const text = normalize([m.name, m.category, m.description, medicineDetail(m, 'Indicações'), medicineDetail(m, 'Princípio ativo')].filter(Boolean).join(' '));
        return (region.match.test(text) || (region.match === MUSCLE && PAIN.test(text))) && !used.has(m.id);
      }).slice(0, 2).map(m => { used.add(m.id); return { medicine: m, region }; });
    });
  }, [catalog.data, marked]);

  return <View style={[styles.page, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
      <ScreenHeader back title="Onde você sente dor?" subtitle="Toque nas regiões do corpo">
        <View style={styles.segment} accessibilityRole="tablist">
          {(['frente', 'costas'] as Side[]).map(s => <Pressable key={s} accessibilityRole="tab" accessibilityState={{ selected: side === s }} onPress={() => setSide(s)}
            style={[styles.segmentItem, side === s && { backgroundColor: colors.surface }]}>
            <AppText color={side === s ? colors.primaryDark : '#FFFFFF'} style={styles.bold}>{s === 'frente' ? 'Frente' : 'Costas'}</AppText>
          </Pressable>)}
        </View>
      </ScreenHeader>
      <View style={styles.body}>
        <View style={styles.top}>
          <View style={[styles.figureCard, { backgroundColor: colors.surface }, Shadow]}>
            <View style={styles.figure}>
              <View style={[styles.halo, { backgroundColor: colors.orangeSoft }]} />
              {REGIONS.filter(r => r.sides.includes(side)).map(region => {
                const on = marked.includes(region.id);
                return region.shapes.map((shape, i) => <Pressable key={region.id + i} accessibilityRole="checkbox" accessibilityLabel={region.label} accessibilityState={{ checked: on }} onPress={() => toggle(region.id)}
                  style={[styles.part, shape, { backgroundColor: on ? '#E8754A' : colors.border }]} />);
              })}
            </View>
          </View>
          <View style={styles.side}>
            <View style={[styles.box, { backgroundColor: colors.surface }, Shadow]}>
              <AppText variant="caption">Regiões marcadas</AppText>
              <View style={styles.chips}>
                {marked.length ? marked.map(id => <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Desmarcar ${REGIONS.find(r => r.id === id)?.label}`} onPress={() => toggle(id)} style={[styles.chip, { backgroundColor: colors.orangeSoft }]}>
                  <AppText variant="caption" color={colors.orange} style={styles.bold}>{REGIONS.find(r => r.id === id)?.label} ×</AppText>
                </Pressable>) : <AppText variant="caption" color={colors.textMuted}>Nenhuma ainda</AppText>}
              </View>
            </View>
            <View style={[styles.box, { backgroundColor: colors.primary }]}>
              <AppText variant="h2" color="#FFFFFF">{suggestions.length}</AppText>
              <AppText variant="label" color="rgba(255,255,255,0.92)">{suggestions.length === 1 ? 'sugestão sem receita para você' : 'sugestões sem receita para você'}</AppText>
            </View>
            <View style={[styles.box, styles.notice, { backgroundColor: colors.blueSoft }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.blue} />
              <AppText variant="caption" color={colors.blue} style={styles.flex}>Confirme com o farmacêutico antes de usar.</AppText>
            </View>
          </View>
        </View>

        <AppText variant="h3">Pode ajudar</AppText>
        {catalog.loading && <AppText variant="label">Carregando remédios…</AppText>}
        {!!catalog.error && <AppText variant="label" color={colors.danger}>{catalog.error}</AppText>}
        {!catalog.loading && !marked.length && <AppText variant="label">Marque uma ou mais regiões no corpo para ver sugestões.</AppText>}
        {!catalog.loading && !!marked.length && !suggestions.length && <AppText variant="label">Não encontramos remédios sem receita para essas regiões. Fale com o farmacêutico.</AppText>}
        {suggestions.map(({ medicine, region }, index) => {
          const tone = TONES[index % TONES.length];
          return <Pressable key={medicine.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/medicamento/[id]', params: { id: medicine.id } })}
            style={({ pressed }) => [styles.suggestion, { backgroundColor: colors.surface }, Shadow, pressed && styles.pressed]}>
            <View style={[styles.icon, { backgroundColor: tone === 'orange' ? colors.orangeSoft : tone === 'blue' ? colors.blueSoft : tone === 'purple' ? colors.purpleSoft : colors.primarySoft }]}>
              <Ionicons name="bandage-outline" size={22} color={tone === 'orange' ? colors.orange : tone === 'blue' ? colors.blue : tone === 'purple' ? colors.purple : colors.primaryDark} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyBold" numberOfLines={1}>{medicineTitle(medicine)}</AppText>
              <AppText variant="label">Para {region.label.toLowerCase()}</AppText>
            </View>
            <Tag label="MIP" tone="green" />
          </Pressable>;
        })}
      </View>
    </ScrollView>
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14, backgroundColor: colors.background }]}>
      <Button title={saved ? 'Salvo no diário de dores ✓' : 'Salvar no meu diário de dores'} disabled={!marked.length || !care.ready} onPress={() => { care.savePain(marked); setSaved(true); }} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1 }, flex: { flex: 1, minWidth: 0 }, bold: { fontFamily: FontFamily.semibold },
  segment: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 18, padding: 5 },
  segmentItem: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 18, paddingTop: 20, gap: 14 },
  top: { flexDirection: 'row', gap: 12 },
  figureCard: { flex: 1, borderRadius: 26, alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  figure: { width: 160, height: 300 },
  halo: { position: 'absolute', width: 170, height: 170, borderRadius: 85, left: -5, top: 60 },
  part: { position: 'absolute' },
  side: { flex: 1, gap: 12 },
  box: { borderRadius: 22, padding: 14, gap: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 22, padding: 14 },
  pressed: { opacity: 0.85 },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 10 },
});
