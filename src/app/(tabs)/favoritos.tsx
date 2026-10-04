import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/home/app-header';
import { ScreenHero } from '@/components/ui/screen-hero';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { MedicineCard } from '@/components/medicine/medicine-card';
import { useTheme } from '@/context/theme-context';
import { useFavorites } from '@/context/favorites-context';
import { enderecoFarmacia } from '@/services/farmacias';
export default function FavoritesScreen() {
const { colors } = useTheme(); const router = useRouter(); const f = useFavorites(); const [tab, setTab] = useState<'medicines' | 'pharmacies'>('medicines');
  return <View style={[styles.page, { backgroundColor: colors.background }]}><AppHeader /><ScrollView contentContainerStyle={styles.content}>
    <ScreenHero title="Favoritos" subtitle="Seus locais e medicamentos salvos para acesso rápido." icon="heart" />
    <View style={[styles.tabs, { backgroundColor: colors.surfaceMuted }]}>{([{ key: 'medicines', title: 'Medicamentos' }, { key: 'pharmacies', title: 'Farmácias' }] as const).map(t => <Pressable key={t.key} accessibilityRole="tab" accessibilityState={{ selected: tab === t.key }} onPress={() => setTab(t.key)} style={[styles.tab, { backgroundColor: tab === t.key ? colors.primary : colors.surfaceMuted }]}><AppText variant="label" color={tab === t.key ? '#FFFFFF' : colors.text}>{t.title}</AppText></Pressable>)}</View>
    {!f.ready ? <AppText>Carregando favoritos…</AppText> : tab === 'medicines' ? <>
      {f.medicines.length === 0 && <AppText color={colors.textSecondary}>Você ainda não salvou medicamentos. Use “Salvar nos favoritos” na lista de remédios.</AppText>}
      {f.medicines.map(m => <MedicineCard key={m.id} medicine={m} onPress={() => router.push({ pathname: '/medicamento/[id]', params: { id: m.id } })} />)}
    </> : <>
      {f.pharmacies.length === 0 && <AppText color={colors.textSecondary}>Você ainda não salvou farmácias. Toque na estrela na lista de farmácias.</AppText>}
      {f.pharmacies.map(p => <View key={p.idFarmacia} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><AppText variant="h3">{p.nomeFarmacia}</AppText><AppText variant="label">{enderecoFarmacia(p)}</AppText><Button title="Ver rota" onPress={() => router.push({ pathname: '/rota', params: { farmaciaId: String(p.idFarmacia) } })} /><Button title="Ver estoque" variant="outline" onPress={() => router.push({ pathname: '/farmacia/[id]', params: { id: String(p.idFarmacia) } })} /><Button title="Remover dos favoritos" variant="ghost" onPress={() => f.togglePharmacy(p)} /></View>)}
    </>}
  </ScrollView></View>;
}
const styles = StyleSheet.create({ page: { flex: 1 }, content: { padding: 18, gap: 16, paddingBottom: 32 }, tabs: { flexDirection: 'row', padding: 4, borderRadius: 24 }, tab: { flex: 1, padding: 12, borderRadius: 24, alignItems: 'center' }, card: { padding: 18, gap: 12, borderWidth: 1, borderRadius: 24, boxShadow: '0 4px 16px rgba(20,63,50,0.08)' } });
