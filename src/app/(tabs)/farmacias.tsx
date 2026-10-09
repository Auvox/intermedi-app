import { Ionicons } from '@expo/vector-icons';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { useFavorites } from '@/context/favorites-context';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/home/app-header';
import { PharmacyPhoto } from '@/components/pharmacy/pharmacy-photo';
import { ScreenHero } from '@/components/ui/screen-hero';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { listarFarmacias, enderecoFarmacia } from '@/services/farmacias';
import { useApiResource } from '@/hooks/use-api-resource';
import { Radius, Spacing } from '@/constants/theme';

export default function FarmaciasScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const favorites = useFavorites();
  const [expandedId, setExpandedId] = useState<string>();
  const { data, loading, error, reload } = useApiResource(listarFarmacias);
  const farmacias = data ?? [];
  return <View style={[styles.flex, { backgroundColor: colors.background }]}>
    <AppHeader />
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHero title="Farmácias" subtitle="Encontre a farmácia mais próxima de você." icon="business-outline">
        <Pressable accessibilityRole="button" accessibilityLabel="Buscar farmácias" onPress={() => router.push({ pathname: '/pesquisa', params: { filtro: 'pharmacies', origem: 'farmacias' } })} style={[styles.search, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={23} color={colors.primaryDark} />
          <AppText variant="label" style={styles.info}>Buscar por nome ou endereço</AppText>
          <Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
        </Pressable>
      </ScreenHero>
      <AppText variant="h3">Farmácias cadastradas</AppText>
      {loading && <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando farmácias" />}
      {!!error && <View><AppText>{error}</AppText><Pressable accessibilityRole="button" onPress={reload}><AppText color={colors.primary}>Tentar novamente</AppText></Pressable></View>}
      {!loading && !error && farmacias.length === 0 && <AppText>Nenhuma farmácia encontrada.</AppText>}
      {!loading && !error && farmacias.map(f => <View key={f.idFarmacia}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
<View style={styles.favorite}><FavoriteButton selected={favorites.pharmacies.some(p => p.idFarmacia === f.idFarmacia)} disabled={!favorites.ready}
          label={favorites.pharmacies.some(p => p.idFarmacia === f.idFarmacia) ? 'Remover farmácia dos favoritos' : 'Salvar farmácia nos favoritos'} onPress={() => favorites.togglePharmacy(f)} /></View>
        <Pressable accessibilityRole="button" accessibilityLabel={f.nomeFarmacia} accessibilityState={{ expanded: expandedId === String(f.idFarmacia) }}
          onPress={() => setExpandedId(expandedId === String(f.idFarmacia) ? undefined : String(f.idFarmacia))} style={styles.summary}>
          <PharmacyPhoto photo={f.fotoFarmacia} name={f.nomeFarmacia} />
          <AppText variant="bodyBold" style={styles.info}>{f.nomeFarmacia}</AppText>
          <Ionicons name={expandedId === String(f.idFarmacia) ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </Pressable>
        {expandedId === String(f.idFarmacia) && <View style={styles.cardContent}>
          <AppText variant="label">{enderecoFarmacia(f)}</AppText>
          {!!f.telFarmacia && <AppText>Telefone: {f.telFarmacia}</AppText>}
          {!!f.emailFarmacia && <AppText>E-mail: {f.emailFarmacia}</AppText>}
          {!!f.cnesFarmacia && <AppText variant="label">CNES: {f.cnesFarmacia}</AppText>}
          <Button compact title="Ver medicamentos e quantidades" variant="outline" onPress={() => router.push({ pathname: '/farmacia/[id]', params: { id: String(f.idFarmacia) } })} />
        <Button compact title="Ver rota" fullWidth={false}
          accessibilityLabel={`Ver rota para ${f.nomeFarmacia}`}
          onPress={() => router.push({ pathname: '/rota', params: { farmaciaId: String(f.idFarmacia) } })} />
        </View>}
      </View>)}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderRadius: 16, padding: Spacing.md, minHeight: 50 },
  flex: { flex: 1 }, content: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  card: { boxShadow: '0 4px 16px rgba(20,63,50,0.08)', padding: Spacing.lg, gap: Spacing.sm, borderRadius: Radius.lg, borderWidth: 1 },
  favorite: { position: 'absolute', top: 8, right: 8, zIndex: 1 },
  summary: { minHeight: 68, paddingRight: 40, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardContent: { gap: Spacing.sm },
  row: { paddingRight: 36, flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, info: { flex: 1, gap: Spacing.sm },
});
