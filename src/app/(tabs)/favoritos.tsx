import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AppText } from '@/components/ui/app-text';
import { EmptyState } from '@/components/ui/surface';
import { MedicineCard } from '@/components/medicine/medicine-card';
import { PharmacyListCard } from '@/components/pharmacy/pharmacy-list-card';
import { FontFamily } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useFavorites } from '@/context/favorites-context';
import { useApiResource } from '@/hooks/use-api-resource';
import { mapaDisponibilidade } from '@/services/disponibilidade';
export default function FavoritesScreen() {
  const { colors } = useTheme(); const router = useRouter(); const f = useFavorites(); const [tab, setTab] = useState<'medicines' | 'pharmacies'>('medicines');
  const disponibilidade = useApiResource(mapaDisponibilidade);
  return <View style={[styles.page, { backgroundColor: colors.background }]}><ScrollView contentContainerStyle={styles.scroll}>
    <ScreenHeader title="Favoritos" subtitle="Salvos para acesso rápido" />
    <View style={styles.content}>
      <View style={[styles.tabs, { backgroundColor: colors.surfaceMuted }]} accessibilityRole="tablist">{([{ key: 'medicines', title: 'Remédios' }, { key: 'pharmacies', title: 'Farmácias' }] as const).map(t => <Pressable key={t.key} accessibilityRole="tab" accessibilityState={{ selected: tab === t.key }} onPress={() => setTab(t.key)}
        style={[styles.tab, tab === t.key && { backgroundColor: colors.primary }]}><AppText color={tab === t.key ? '#FFFFFF' : colors.textSecondary} style={styles.tabText}>{t.title}</AppText></Pressable>)}</View>
      {!f.ready ? <AppText variant="label">Carregando favoritos…</AppText> : tab === 'medicines' ? <>
        {f.medicines.length === 0 && <EmptyState icon="heart-outline" title="Nenhum remédio salvo" text="Toque no coração na página de um remédio para salvá-lo aqui." />}
        {f.medicines.map(m => <MedicineCard key={m.id} medicine={m} showFavorite pharmacyCount={disponibilidade.data ? (disponibilidade.data.porRemedio[m.id]?.length ?? 0) : undefined} onPress={() => router.push({ pathname: '/medicamento/[id]', params: { id: m.id } })} />)}
      </> : <>
        {f.pharmacies.length === 0 && <EmptyState icon="heart-outline" title="Nenhuma farmácia salva" text="Toque no coração na lista de farmácias para salvá-la aqui." />}
        {f.pharmacies.map(p => <PharmacyListCard key={p.idFarmacia} farmacia={p} itemsInStock={disponibilidade.data?.itensPorFarmacia[p.idFarmacia]} />)}
      </>}
    </View>
  </ScrollView></View>;
}
const styles = StyleSheet.create({ page: { flex: 1 }, scroll: { paddingBottom: 120 }, content: { padding: 18, paddingTop: 22, gap: 14 }, tabs: { flexDirection: 'row', padding: 5, borderRadius: 18 }, tab: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, tabText: { fontFamily: FontFamily.semibold } });
