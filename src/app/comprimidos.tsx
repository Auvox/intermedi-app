import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MedicineThumb } from '@/components/medicine/medicine-thumb';
import { PillVisual } from '@/components/medicine/pill-visual';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EmptyState, Tag } from '@/components/ui/surface';
import { FontFamily, Shadow } from '@/constants/theme';
import { formatTime, useCare } from '@/context/care-context';
import { useTheme } from '@/context/theme-context';
import { longDate } from '@/utils/dates';

const PILL_DESCRIPTION = { round: 'Redondo, com sulco no meio', capsule: 'Cápsula de duas cores', oval: 'Formato oval' } as const;

export default function ComprimidosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const care = useCare();
  const doses = care.todayDoses;
  const [selectedId, setSelectedId] = useState<string>();
  const [back, setBack] = useState(false);
  const spin = useSharedValue(0);
  const selected = doses.find(d => d.id === selectedId) ?? care.nextDose ?? doses[0];
  const taken = doses.filter(d => d.status === 'tomado').length;
  const pillStyle = useAnimatedStyle(() => ({ transform: [{ perspective: 600 }, { rotateY: `${spin.value}deg` }] }));
  function select(id?: string) { setSelectedId(id); setBack(false); spin.set(0); }
  function rotate() {
    const next = !back;
    spin.set(withTiming(next ? 180 : 0, { duration: 450 }));
    setTimeout(() => setBack(next), 225);
  }

  return <View style={[styles.page, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <ScreenHeader back title="Seus comprimidos" subtitle={longDate()} overlap={doses.length ? 70 : 0}>
        <View style={styles.progressHead}>
          <AppText variant="label" color="rgba(255,255,255,0.9)">Doses de hoje</AppText>
          <AppText variant="label" color="#FFFFFF" style={styles.bold}>{taken} de {doses.length}</AppText>
        </View>
        <View style={styles.track}><View style={[styles.fill, { width: doses.length ? `${(taken / doses.length) * 100}%` : '0%' }]} /></View>
      </ScreenHeader>

      <View style={[styles.body, { marginTop: doses.length ? -56 : 20 }]}>
        {!care.ready ? <AppText variant="label">Carregando sua rotina…</AppText> : !selected ? <EmptyState icon="ellipse-outline" title="Nenhum remédio na sua rotina" text="Abra um remédio e toque em “Adicionar à rotina” para receber lembretes aqui.">
          <Button compact fullWidth={false} title="Ver remédios" onPress={() => router.push('/buscar-medicamentos')} />
        </EmptyState> : <>
          <View style={[styles.featured, { backgroundColor: colors.surface }, Shadow]}>
            <View style={[styles.viewer, { backgroundColor: colors.primarySoft }]}>
              <View style={[styles.side, { backgroundColor: colors.surface }]}><AppText variant="caption" color={colors.text}>{back ? 'Vista de trás' : 'Vista de frente'}</AppText></View>
              <View style={styles.halo} />
              <Animated.View style={pillStyle}>
                {selected.photo ? <Image source={{ uri: selected.photo }} style={styles.photo} resizeMode="contain" accessibilityLabel={`Foto de ${selected.name}`} />
                  : <PillVisual kind={selected.kind} size={128} back={back} colors={selected.kind === 'capsule' ? ['#7F74E0', '#EF8FA6'] : undefined} />}
              </Animated.View>
              <Pressable accessibilityRole="button" accessibilityLabel="Girar comprimido" onPress={rotate} style={[styles.rotate, { backgroundColor: colors.surface }, Shadow]}>
                <Ionicons name="refresh" size={18} color={colors.text} />
                <AppText variant="label" color={colors.text} style={styles.bold}>Girar</AppText>
              </Pressable>
            </View>
            <View style={styles.featuredInfo}>
              <View style={styles.flex}>
                <AppText variant="h3">{selected.name} {selected.dosage}</AppText>
                <AppText variant="label">{PILL_DESCRIPTION[selected.kind]}</AppText>
              </View>
              <Tag label={formatTime(selected.time)} tone="amber" />
            </View>
            <Pressable accessibilityRole="button" onPress={() => { care.removeDose(selected.id); select(undefined); }} style={styles.remove}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <AppText variant="caption" color={colors.danger}>Remover da rotina</AppText>
            </Pressable>
          </View>

          {doses.map(dose => {
            const active = dose.id === selected.id;
            return <View key={dose.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: active ? colors.primary : 'transparent' }, Shadow]}>
              <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={`Ver ${dose.name} às ${dose.time}`} onPress={() => select(dose.id)} style={styles.rowOpen}>
                <MedicineThumb uri={dose.photo} kind={dose.kind} tone="neutral" size={50} name={dose.name} />
                <View style={styles.flex}>
                  <AppText variant="bodyBold" numberOfLines={1}>{dose.name} {dose.dosage}</AppText>
                  <AppText variant="label">{dose.time}</AppText>
                </View>
              </Pressable>
              {dose.status === 'tomado'
                ? <Pressable accessibilityRole="button" accessibilityLabel="Desfazer dose tomada" onPress={() => care.setDoseStatus(dose.id, null)} style={[styles.done, { backgroundColor: colors.primarySoft }]}>
                  <AppText variant="label" color={colors.primaryDark} style={styles.bold}>Tomado</AppText><Ionicons name="checkmark" size={16} color={colors.primaryDark} />
                </Pressable>
                : <Button compact fullWidth={false} title={dose.status === 'pulado' ? 'Pulada' : 'Tomar'} variant={dose.status === 'pulado' ? 'outline' : 'solid'} onPress={() => care.setDoseStatus(dose.id, 'tomado')} />}
            </View>;
          })}
        </>}
      </View>
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1 }, flex: { flex: 1, minWidth: 0 }, bold: { fontFamily: FontFamily.semibold },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden', marginTop: -8 },
  fill: { height: '100%', borderRadius: 5, backgroundColor: '#8FE0B5' },
  body: { paddingHorizontal: 18, gap: 12 },
  featured: { borderRadius: 28, padding: 16, gap: 14, marginBottom: 4 },
  viewer: { height: 220, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  halo: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.55)' },
  side: { position: 'absolute', top: 12, left: 12, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5, zIndex: 1 },
  photo: { width: 170, height: 150 },
  rotate: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, paddingHorizontal: 14, minHeight: 44 },
  featuredInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  remove: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minHeight: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 22, padding: 14, borderWidth: 2 },
  rowOpen: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  done: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, paddingHorizontal: 14, minHeight: 44 },
});
