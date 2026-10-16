import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { PharmacyListCard } from '@/components/pharmacy/pharmacy-list-card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EmptyState } from '@/components/ui/surface';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { useHomeLocation } from '@/hooks/use-home-location';
import { listarFarmacias } from '@/services/farmacias';
import { distanciaKm, mapaDisponibilidade } from '@/services/disponibilidade';
import { useApiResource } from '@/hooks/use-api-resource';
import { Spacing } from '@/constants/theme';

export default function FarmaciasScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data, loading, error, reload } = useApiResource(listarFarmacias);
  const disponibilidade = useApiResource(mapaDisponibilidade);
  const { position } = useHomeLocation();
  const farmacias = (data ?? []).map(f => ({ farmacia: f, distance: position ? distanciaKm(position, f) : undefined }))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  return <View style={[styles.flex, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={styles.scroll}>
      <ScreenHeader title="Farmácias" subtitle="Encontre a mais próxima de você">
        <Pressable accessibilityRole="button" accessibilityLabel="Buscar por nome ou endereço" onPress={() => router.push({ pathname: '/pesquisa', params: { filtro: 'pharmacies', origem: 'farmacias' } })} style={[styles.search, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={22} color={colors.textSecondary} />
          <AppText color={colors.textMuted} style={styles.flex}>Buscar por nome ou endereço</AppText>
        </Pressable>
      </ScreenHeader>
      <View style={styles.content}>
        {!loading && !error && <AppText variant="label">{farmacias.length} {farmacias.length === 1 ? 'farmácia' : 'farmácias'} {position ? 'perto de você' : 'cadastradas'}</AppText>}
        {loading && <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando farmácias" />}
        {!!error && <View><AppText>{error}</AppText><Button compact variant="ghost" title="Tentar novamente" onPress={reload} /></View>}
        {!loading && !error && farmacias.length === 0 && <EmptyState icon="business-outline" title="Nenhuma farmácia encontrada" />}
        {!loading && !error && farmacias.map(({ farmacia, distance }) => <PharmacyListCard key={farmacia.idFarmacia} farmacia={farmacia} distance={distance}
          itemsInStock={disponibilidade.data?.itensPorFarmacia[farmacia.idFarmacia]} />)}
      </View>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 120 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, paddingHorizontal: 18, minHeight: 58 },
  content: { paddingHorizontal: 18, paddingTop: Spacing.xl, gap: 14 },
});
