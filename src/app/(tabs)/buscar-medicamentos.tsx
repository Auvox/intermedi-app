import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/home/app-header';
import { MedicineCard } from '@/components/medicine/medicine-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ScreenHero } from '@/components/ui/screen-hero';
import { useTheme } from '@/context/theme-context';
import { useApiResource } from '@/hooks/use-api-resource';
import { listarMedicamentos } from '@/services/medicamentos';
import { Spacing } from '@/constants/theme';

export default function MedicamentosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data, loading, error, reload } = useApiResource(listarMedicamentos);
  return <View style={[styles.flex, { backgroundColor: colors.background }]}>
    <AppHeader />
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHero title="Remédios" subtitle="Encontre o medicamento que você precisa." icon="medkit-outline">
        <Pressable accessibilityRole="button" accessibilityLabel="Buscar medicamentos e farmácias" onPress={() => router.push({ pathname: '/pesquisa', params: { filtro: 'medicines', origem: 'remedios' } })} style={[styles.search, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={23} color={colors.primaryDark} />
          <AppText variant="label" style={styles.flex}>Buscar por nome ou categoria</AppText>
          <Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
        </Pressable>
      </ScreenHero>
      <AppText variant="h3">Medicamentos disponíveis</AppText>
      {loading && <ActivityIndicator color={colors.primaryDark} accessibilityLabel="Carregando medicamentos" />}
      {!!error && <View><AppText>{error}</AppText><Button title="Tentar novamente" compact variant="ghost" onPress={reload} /></View>}
      {!loading && !error && !data?.length && <AppText variant="label">Nenhum medicamento cadastrado.</AppText>}
      {!loading && !error && data?.map(medicine => <MedicineCard key={medicine.id} medicine={medicine} onPress={() => router.push({ pathname: '/medicamento/[id]', params: { id: medicine.id } })} />)}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  search: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderRadius: 16, padding: Spacing.md, minHeight: 50 },
});
