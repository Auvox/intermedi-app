import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillVisual } from '@/components/medicine/pill-visual';
import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { IconTile, Tag } from '@/components/ui/surface';
import type { Medicine } from '@/constants/mock-data';
import { FontFamily, Shadow, Spacing, toneColors, type Tone } from '@/constants/theme';
import { useCare } from '@/context/care-context';
import { useFavorites } from '@/context/favorites-context';
import { useTheme } from '@/context/theme-context';
import { useApiResource } from '@/hooks/use-api-resource';
import { useHomeLocation } from '@/hooks/use-home-location';
import { distanciaKm, formatarKm, mapaDisponibilidade, POUCAS_UNIDADES } from '@/services/disponibilidade';
import { buscarMedicamento } from '@/services/medicamentos';
import { categoryStyle, medicineDetail, medicineTitle, pillKind, primaryTone, requiresPrescription, splitCategories } from '@/utils/medicine-style';

const DETAIL_GROUPS = [
  { title: 'Sobre o medicamento', labels: ['Princípio ativo', 'Categorias', 'Fabricante', 'Tipo'] },
  { title: 'Apresentação e administração', labels: ['Apresentação', 'Forma farmacêutica', 'Via de administração'] },
  { title: 'Receita e classificação', labels: ['Tarja', 'Exige receita', 'Retém receita', 'Registro ANVISA'] },
  { title: 'Indicações e cuidados', labels: ['Indicações', 'Contraindicações', 'Armazenamento'] },
  { title: 'Dados do cadastro', labels: ['Código do medicamento', 'Cadastrado em', 'Atualizado em'] },
] as const;
const TIMES = ['06:00', '07:30', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00'];

export default function MedicamentoScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const favorites = useFavorites();
  const care = useCare();
  const { position } = useHomeLocation();
  const disponibilidade = useApiResource(mapaDisponibilidade);
  const [medicine, setMedicine] = useState<Medicine | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [routineOpen, setRoutineOpen] = useState(false);
  const [time, setTime] = useState('08:00');
  useFocusEffect(useCallback(() => {
    let ativo = true;
    setMedicine(undefined);
    setLoading(true);
    setError('');
    buscarMedicamento(id).then((dados) => { if (ativo) setMedicine(dados); })
      .catch((erro: unknown) => { if (ativo) setError(erro instanceof Error ? erro.message : 'Erro ao carregar medicamento.'); })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [id, tentativa]));

  if (!medicine) {
    return (
      <View style={[styles.flex, styles.notFound, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
        <View style={styles.notFoundBack}><BackButton tone="dark" /></View>
        {loading ? <ActivityIndicator color={colors.primaryDark} /> : null}
        <AppText>{loading ? 'Carregando medicamento…' : error || 'Medicamento não encontrado.'}</AppText>
        {!!error && <Button compact fullWidth={false} variant="ghost" title="Tentar novamente" onPress={() => setTentativa((v) => v + 1)} />}
      </View>
    );
  }

  const tone = primaryTone(medicine);
  const heroBg = toneColors(colors, tone).bg;
  const prescription = requiresPrescription(medicine);
  const favorite = favorites.medicines.some(m => m.id === medicine.id);
  const categories = splitCategories(medicine.category);
  const subtitle = medicineDetail(medicine, 'Princípio ativo') ?? (categories.join(', ') || undefined);
  const tiles: { label: string; value?: string; icon: keyof typeof Ionicons.glyphMap; tone: Tone }[] = [
    { label: 'Forma', value: medicineDetail(medicine, 'Forma farmacêutica'), icon: 'ellipse-outline', tone: 'blue' },
    { label: 'Embalagem', value: medicineDetail(medicine, 'Apresentação'), icon: 'cube-outline', tone: 'amber' },
    { label: 'Fabricante', value: medicineDetail(medicine, 'Fabricante'), icon: 'business-outline', tone: 'purple' },
    { label: 'Tipo', value: medicineDetail(medicine, 'Tipo') ?? medicineDetail(medicine, 'Tarja'), icon: 'checkmark', tone: 'green' },
  ];
  const nearby = (disponibilidade.data?.porRemedio[medicine.id] ?? [])
    .map(item => ({ ...item, distance: position ? distanciaKm(position, item.farmacia) : undefined }))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity) || b.quantidade - a.quantidade);
  const nearest = nearby[0];
  const inRoutine = care.doses.some(d => d.medicineId === medicine.id);

  return (
    <View style={[styles.flex, { backgroundColor: colors.surface }]}>
      <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={[styles.hero, { backgroundColor: heroBg, paddingTop: insets.top + 16 }]}>
          <View style={[styles.bubble, { width: 240, height: 240, borderRadius: 120, right: -60, top: -40 }]} />
          <View style={[styles.bubble, { width: 180, height: 180, borderRadius: 90, left: -70, bottom: 30 }]} />
          <View style={styles.heroBar}>
            <BackButton tone="dark" />
            <FavoriteButton floating selected={favorite} disabled={!favorites.ready} label={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'} onPress={() => favorites.toggleMedicine(medicine)} />
          </View>
          <View style={styles.heroArt}>
            {medicine.photo ? <Image source={{ uri: medicine.photo }} resizeMode="contain" style={styles.photo} accessibilityLabel={`Foto de ${medicine.name}`} />
              : <PillVisual kind={pillKind(medicine)} size={140} colors={pillKind(medicine) === 'capsule' ? ['#EE8F68', '#FFFFFF'] : undefined} />}
          </View>
        </View>

        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.tags}>
            {categories.slice(0, 2).map(c => <Tag key={c} label={c} tone={categoryStyle(c).tone} />)}
            <Tag label={prescription ? 'Exige receita' : 'Sem receita'} tone={prescription ? 'amber' : 'green'} />
          </View>
          <View>
            <AppText variant="h2">{medicineTitle(medicine)}</AppText>
            {!!subtitle && <AppText color={colors.textSecondary}>{subtitle}</AppText>}
          </View>
          <View style={styles.tiles}>
            {tiles.map(t => <View key={t.label} style={[styles.tile, { backgroundColor: colors.surfaceMuted }]}>
              <IconTile icon={t.icon} tone={t.tone} size={36} />
              <View style={styles.flex}>
                <AppText variant="caption">{t.label}</AppText>
                <AppText variant="bodyBold" numberOfLines={3} style={styles.tileValue}>{t.value ? t.value.charAt(0).toUpperCase() + t.value.slice(1) : 'Não informado'}</AppText>
              </View>
            </View>)}
          </View>
          <AppText color={colors.textSecondary}>{medicine.description}</AppText>

          <AppText variant="h3">Disponível perto de você</AppText>
          {disponibilidade.loading && <ActivityIndicator color={colors.primaryDark} accessibilityLabel="Consultando farmácias com estoque" />}
          {!!disponibilidade.error && <View style={styles.inline}><AppText variant="label" color={colors.danger} style={styles.flex}>{disponibilidade.error}</AppText><Button compact fullWidth={false} variant="ghost" title="Tentar de novo" onPress={disponibilidade.reload} /></View>}
          {disponibilidade.data?.consultaIncompleta && <AppText variant="caption">Algumas farmácias não puderam ser consultadas.</AppText>}
          {disponibilidade.data && !nearby.length && <View style={[styles.place, { borderColor: colors.border }]}>
            <IconTile icon="notifications-outline" tone="neutral" size={44} />
            <AppText variant="label" style={styles.flex}>Nenhuma farmácia tem este remédio em estoque no momento.</AppText>
          </View>}
          {nearby.map(({ farmacia, quantidade, distance }) => {
            const few = quantidade < POUCAS_UNIDADES;
            return <Pressable key={farmacia.idFarmacia} accessibilityRole="button" accessibilityLabel={`${farmacia.nomeFarmacia}, ${quantidade} unidades`}
              onPress={() => router.push({ pathname: '/farmacia/[id]', params: { id: String(farmacia.idFarmacia) } })}
              style={({ pressed }) => [styles.place, { borderColor: colors.border }, pressed && styles.pressed]}>
              <IconTile icon="location-outline" tone={few ? 'amber' : 'green'} size={46} />
              <View style={styles.flex}>
                <AppText variant="bodyBold" numberOfLines={2}>{farmacia.nomeFarmacia}</AppText>
                <AppText variant="label">{[formatarKm(distance), `${quantidade.toLocaleString('pt-BR')} ${quantidade === 1 ? 'unidade' : 'unidades'}`].filter(Boolean).join(' · ')}</AppText>
              </View>
              <Tag label={few ? 'Poucas unid.' : 'Em estoque'} tone={few ? 'amber' : 'green'} />
            </Pressable>;
          })}

          <Pressable accessibilityRole="button" accessibilityState={{ expanded: moreOpen }} onPress={() => setMoreOpen(v => !v)} style={[styles.more, { borderColor: colors.border }]}>
            <AppText variant="bodyBold" style={styles.flex}>Mais informações</AppText>
            <Ionicons name={moreOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
          </Pressable>
          {moreOpen && DETAIL_GROUPS.map(group => {
            const fields = medicine.details?.filter(field => (group.labels as readonly string[]).includes(field.label)) ?? [];
            if (!fields.length) return null;
            return <View key={group.title} style={[styles.group, { backgroundColor: colors.surfaceMuted }]}>
              <AppText variant="label" color={colors.primaryDark} style={styles.groupTitle}>{group.title}</AppText>
              {fields.map(field => <View key={field.label} style={styles.detailRow}>
                <AppText variant="caption">{field.label}</AppText>
                <AppText variant="label" color={field.value === 'Não informado' ? colors.textMuted : colors.text}>{field.value}</AppText>
              </View>)}
            </View>;
          })}
        </View>
      </ScrollView>

      <View style={[styles.actions, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 14 }]}>
        <Button variant="outline" fullWidth={false} title="Mapa" disabled={!nearest} icon={<Ionicons name="map-outline" size={20} color={colors.text} />}
          accessibilityLabel={nearest ? `Ver rota até ${nearest.farmacia.nomeFarmacia}` : 'Nenhuma farmácia com estoque'}
          onPress={() => nearest && router.push({ pathname: '/rota', params: { farmaciaId: String(nearest.farmacia.idFarmacia) } })} style={styles.mapButton} />
        <Button title={inRoutine ? 'Ver na minha rotina' : 'Adicionar à rotina'} onPress={() => inRoutine ? router.push('/comprimidos') : setRoutineOpen(true)} style={styles.flex} />
      </View>

      <Modal visible={routineOpen} transparent animationType="slide" onRequestClose={() => setRoutineOpen(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setRoutineOpen(false)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 20 }]} onPress={e => e.stopPropagation()}>
            <AppText variant="h3">Que horas você toma?</AppText>
            <AppText variant="label">Eu te lembro todo dia nesse horário. A rotina fica salva neste aparelho.</AppText>
            <View style={styles.times}>{TIMES.map(t => <Pressable key={t} accessibilityRole="radio" accessibilityState={{ checked: time === t }} onPress={() => setTime(t)}
              style={[styles.time, { backgroundColor: time === t ? colors.primary : colors.surfaceMuted }]}>
              <AppText variant="label" color={time === t ? '#FFFFFF' : colors.text} style={styles.timeText}>{t}</AppText>
            </Pressable>)}</View>
            <Button title={`Adicionar às ${time}`} onPress={() => {
              care.addDose({ medicineId: medicine.id, name: medicine.name, dosage: medicine.dosage, time, kind: pillKind(medicine), tone, photo: medicine.photo });
              setRoutineOpen(false);
              router.push('/comprimidos');
            }} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  notFound: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  notFoundBack: { position: 'absolute', top: 56, left: 20 },
  hero: { height: 330, paddingHorizontal: 20, overflow: 'hidden' },
  bubble: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.4)' },
  heroBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroArt: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 30 },
  photo: { width: '70%', height: 190 },
  sheet: { marginTop: -34, borderTopLeftRadius: 34, borderTopRightRadius: 34, padding: 22, gap: Spacing.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 18, padding: 10 },
  tileValue: { fontSize: 14, lineHeight: 18 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 20, padding: 12 },
  pressed: { opacity: 0.85 },
  more: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 16, marginTop: 4, minHeight: 44 },
  group: { borderRadius: 18, padding: 14, gap: 8 },
  groupTitle: { fontFamily: FontFamily.bold },
  detailRow: { gap: 1 },
  actions: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 12, ...Shadow },
  mapButton: { paddingHorizontal: 22 },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, gap: 14 },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  time: { borderRadius: 14, paddingHorizontal: 16, minHeight: 46, justifyContent: 'center' },
  timeText: { fontFamily: FontFamily.semibold },
});
