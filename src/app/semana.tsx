import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { MASCOTS, Mascot } from '@/components/ui/mascot';
import { ScreenHeader } from '@/components/ui/screen-header';
import { IconTile } from '@/components/ui/surface';
import { FontFamily, Shadow, type Tone } from '@/constants/theme';
import { dayKey, useCare } from '@/context/care-context';
import { useTheme } from '@/context/theme-context';
import { useUser } from '@/context/user-context';
import { useApiResource } from '@/hooks/use-api-resource';
import { mapaDisponibilidade } from '@/services/disponibilidade';
import { lastDays, weekRange } from '@/utils/dates';

const REGION_LABEL: Record<string, string> = { cabeca: 'cabeça', garganta: 'garganta', nuca: 'nuca', peito: 'peito', costas: 'costas', barriga: 'barriga', lombar: 'lombar', bracos: 'braços', maos: 'mãos', pernas: 'pernas', joelhos: 'joelhos', pes: 'pés' };

export default function SemanaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useUser();
  const care = useCare();
  const disponibilidade = useApiResource(mapaDisponibilidade);
  const days = lastDays(7);
  const keys = days.map(d => dayKey(d));
  const today = dayKey();

  // Doses previstas: cada dose conta a partir do dia em que entrou na rotina.
  const createdDay = (id: string) => { const ts = Number(id.split('-').pop()); return Number.isFinite(ts) ? dayKey(new Date(ts)) : keys[0]; };
  let expected = 0, confirmed = 0, missed = 0;
  keys.forEach(key => care.doses.forEach(dose => {
    if (createdDay(dose.id) > key) return;
    expected++;
    const status = care.log[key]?.[dose.id]?.status;
    if (status === 'tomado') confirmed++;
    else if (key < today) missed++;
  }));
  const painDays = keys.map(key => care.pains.find(p => p.date === key && p.regions.length));
  const regionCount: Record<string, number> = {};
  painDays.forEach(p => p?.regions.forEach(r => { regionCount[r] = (regionCount[r] ?? 0) + 1; }));
  const [topRegion, topCount] = Object.entries(regionCount).sort((a, b) => b[1] - a[1])[0] ?? [];
  const painTotal = painDays.filter(Boolean).length;
  const firstName = user?.nome?.trim().split(' ')[0];
  const mascot = MASCOTS[care.mascot];

  const insights: { icon: keyof typeof Ionicons.glyphMap; tone: Tone; title: string; text: string; action: string; href: Href }[] = [];
  const medicines = Array.from(new Map(care.doses.map(d => [d.medicineId, d])).values());
  medicines.slice(0, 2).forEach(dose => {
    const count = disponibilidade.data?.porRemedio[dose.medicineId]?.length;
    if (count == null) return;
    insights.push(count > 0
      ? { icon: 'bandage-outline', tone: 'amber', title: `${dose.name} disponível`, text: `${count} ${count === 1 ? 'farmácia tem' : 'farmácias têm'} em estoque`, action: 'Achar', href: { pathname: '/medicamento/[id]', params: { id: dose.medicineId } } }
      : { icon: 'alert-circle-outline', tone: 'red', title: `${dose.name} sem estoque`, text: 'Nenhuma farmácia cadastrada tem agora', action: 'Ver', href: { pathname: '/medicamento/[id]', params: { id: dose.medicineId } } });
  });
  if (topRegion && (topCount ?? 0) >= 2) insights.push({ icon: 'time-outline', tone: 'orange', title: `Dor em ${REGION_LABEL[topRegion] ?? topRegion} em ${topCount} dias`, text: 'Vale comentar na próxima consulta', action: 'Ver', href: '/onde-doi' });
  if (missed > 0) insights.push({ icon: 'document-text-outline', tone: 'blue', title: `${missed} ${missed === 1 ? 'dose sem confirmação' : 'doses sem confirmação'}`, text: 'Confira seus comprimidos de hoje', action: 'Abrir', href: '/comprimidos' });

  const message = !care.doses.length && !painTotal ? 'Ainda não tenho dados desta semana. Adicione seus remédios para eu acompanhar.'
    : missed === 0 ? 'Nenhuma dose anterior sem confirmação. Separei o que vale sua atenção.'
      : `${missed} ${missed === 1 ? 'dose sem confirmação' : 'doses sem confirmação'}. Separei o que vale sua atenção.`;

  async function exportSummary() {
    const lines = [
      `Resumo da semana (${weekRange()}) — Intermedi`,
      user?.nome ? `Paciente: ${user.nome}` : '',
      `Doses confirmadas: ${confirmed} de ${expected}`,
      `Dias com dor: ${painTotal}${topRegion ? ` (mais frequente: ${REGION_LABEL[topRegion] ?? topRegion})` : ''}`,
      care.doses.length ? `Remédios em uso: ${care.doses.map(d => `${d.name} ${d.dosage} às ${d.time}`).join('; ')}` : '',
    ].filter(Boolean).join('\n');
    try { await Share.share({ message: lines, title: 'Resumo da semana' }); } catch { alert(lines); }
  }

  return <View style={[styles.page, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
      <ScreenHeader back title="Sua semana" subtitle={weekRange()} style={styles.header}>
        <View style={styles.speech}>
          <View style={styles.mascot}><Mascot id={care.mascot} size={120} shadow={false} /></View>
          <View style={[styles.bubble, { backgroundColor: colors.surface }]}>
            <AppText variant="bodyBold">Boa semana{firstName ? `, ${firstName}` : ''}!</AppText>
            <AppText variant="label">{message}</AppText>
          </View>
        </View>
      </ScreenHeader>
      <View style={styles.body}>
        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: colors.surface }, Shadow]}>
            <View style={styles.statHead}><IconTile icon="checkmark" tone="green" size={38} /><AppText variant="caption" style={styles.flex}>Doses confirmadas</AppText></View>
            <AppText variant="h3"><AppText variant="h2" color={colors.primaryDark}>{confirmed}</AppText> de {expected}</AppText>
            <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}><View style={[styles.fill, { width: expected ? `${(confirmed / expected) * 100}%` : '0%', backgroundColor: colors.primaryBright }]} /></View>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.surface }, Shadow]}>
            <View style={styles.statHead}><IconTile icon="pulse-outline" tone="orange" size={38} /><AppText variant="caption" style={styles.flex}>Dias com dor</AppText></View>
            <AppText variant="h3"><AppText variant="h2" color={colors.orange}>{painTotal}</AppText>{topRegion ? ` · ${REGION_LABEL[topRegion] ?? topRegion}` : ''}</AppText>
            <View style={styles.dots}>{painDays.map((p, i) => <View key={keys[i]} style={[styles.dot, { backgroundColor: p ? colors.orange : colors.border }]} />)}</View>
          </View>
        </View>
        <AppText variant="h3">{mascot.pronoun === 'a' ? 'A' : 'O'} {mascot.name} notou</AppText>
        {disponibilidade.loading && !!care.doses.length && <AppText variant="label">Consultando o estoque dos seus remédios…</AppText>}
        {!insights.length && !disponibilidade.loading && <View style={[styles.insight, { backgroundColor: colors.surface }, Shadow]}>
          <IconTile icon="leaf-outline" tone="green" size={46} />
          <View style={styles.flex}><AppText variant="bodyBold">Tudo em ordem por aqui</AppText><AppText variant="label">Continue registrando doses e dores para eu notar padrões.</AppText></View>
        </View>}
        {insights.map(item => <Pressable key={item.title} accessibilityRole="button" onPress={() => router.push(item.href)} style={({ pressed }) => [styles.insight, { backgroundColor: colors.surface }, Shadow, pressed && styles.pressed]}>
          <IconTile icon={item.icon} tone={item.tone} size={46} />
          <View style={styles.flex}><AppText variant="bodyBold">{item.title}</AppText><AppText variant="label">{item.text}</AppText></View>
          <AppText variant="label" color={colors.primaryDark} style={styles.bold}>{item.action}</AppText>
        </Pressable>)}
      </View>
    </ScrollView>
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14, backgroundColor: colors.background }]}>
      <Button title="Exportar resumo para a consulta" icon={<Ionicons name="download-outline" size={20} color="#FFFFFF" />} onPress={exportSummary} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1 }, flex: { flex: 1, minWidth: 0 }, bold: { fontFamily: FontFamily.bold },
  header: { paddingBottom: 0 },
  speech: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: -2 },
  mascot: { height: 104, overflow: 'hidden' },
  bubble: { flex: 1, borderRadius: 20, padding: 14, marginBottom: 22, gap: 2 },
  body: { paddingHorizontal: 18, paddingTop: 20, gap: 14 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, borderRadius: 24, padding: 14, gap: 10 },
  statHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { flex: 1, height: 8, borderRadius: 4 },
  insight: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 22, padding: 14 },
  pressed: { opacity: 0.85 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 10 },
});
