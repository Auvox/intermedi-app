import { FavoriteButton } from '@/components/ui/favorite-button';
import { useFavorites } from '@/context/favorites-context';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TextField } from '@/components/ui/text-field';
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
  const [busca, setBusca] = useState('');
  const { data, loading, error, reload } = useApiResource(listarFarmacias);
  const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const termo = normalizar(busca.trim());
  const farmacias = (data ?? []).filter(f => normalizar(`${f.nomeFarmacia} ${enderecoFarmacia(f)}`).includes(termo));
  return <View style={[styles.flex, { backgroundColor: colors.background }]}>
    <AppHeader />
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHero title="Farmácias" subtitle="Encontre a farmácia mais próxima de você." icon="business-outline">
        <TextField icon="search-outline" placeholder="Buscar por nome ou endereço" value={busca} onChangeText={setBusca} />
      </ScreenHero>
      <AppText variant="h3">Farmácias cadastradas</AppText>
      {loading && <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando farmácias" />}
      {!!error && <View><AppText>{error}</AppText><Pressable accessibilityRole="button" onPress={reload}><AppText color={colors.primary}>Tentar novamente</AppText></Pressable></View>}
      {!loading && !error && farmacias.length === 0 && <AppText>Nenhuma farmácia encontrada.</AppText>}
      {!loading && !error && farmacias.map(f => <View key={f.idFarmacia}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
<View style={styles.favorite}><FavoriteButton selected={favorites.pharmacies.some(p => p.idFarmacia === f.idFarmacia)} disabled={!favorites.ready}
          label={favorites.pharmacies.some(p => p.idFarmacia === f.idFarmacia) ? 'Remover farmácia dos favoritos' : 'Salvar farmácia nos favoritos'} onPress={() => favorites.togglePharmacy(f)} /></View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver estoque de ${f.nomeFarmacia}`}
          onPress={() => router.push({ pathname: '/farmacia/[id]', params: { id: String(f.idFarmacia) } })}
          style={styles.cardContent}>
          <View style={styles.row}><PharmacyPhoto photo={f.fotoFarmacia} name={f.nomeFarmacia} /><View style={styles.info}>
            <AppText variant="bodyBold">{f.nomeFarmacia}</AppText><AppText variant="label">{enderecoFarmacia(f)}</AppText>
          </View></View>
          {!!f.telFarmacia && <AppText>Telefone: {f.telFarmacia}</AppText>}
          {!!f.emailFarmacia && <AppText>E-mail: {f.emailFarmacia}</AppText>}
          {!!f.cnesFarmacia && <AppText variant="label">CNES: {f.cnesFarmacia}</AppText>}
          <AppText variant="bodyBold" color={colors.primary}>Ver medicamentos e quantidades →</AppText>
        </Pressable>
        <Button title="Ver rota" fullWidth={false}
          accessibilityLabel={`Ver rota para ${f.nomeFarmacia}`}
          onPress={() => router.push({ pathname: '/rota', params: { farmaciaId: String(f.idFarmacia) } })} />
      </View>)}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 }, content: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  card: { boxShadow: '0 4px 16px rgba(20,63,50,0.08)', padding: Spacing.lg, gap: Spacing.sm, borderRadius: Radius.lg, borderWidth: 1 },
  favorite: { position: 'absolute', top: 8, right: 8, zIndex: 1 },
  cardContent: { gap: Spacing.sm },
  row: { paddingRight: 36, flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, info: { flex: 1, gap: Spacing.sm },
});
