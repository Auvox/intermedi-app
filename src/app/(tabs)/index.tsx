import { useMemo } from 'react';
import { useApiResource } from '@/hooks/use-api-resource';
import { listarMedicamentos } from '@/services/medicamentos';
import { Button } from '@/components/ui/button';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PharmacyMap } from '@/components/home/pharmacy-map';
import { AppHeader } from '@/components/home/app-header';
import { CategoryCarousel } from '@/components/home/category-carousel';
import { ScreenHero } from '@/components/ui/screen-hero';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { useUser } from '@/context/user-context';
import type { Category } from '@/constants/mock-data';
export default function InicioScreen() {
const router = useRouter(); const { colors } = useTheme(); const { user } = useUser();
  const catalog = useApiResource(listarMedicamentos);
  const categories = useMemo<Category[]>(() => Array.from(new Set((catalog.data ?? []).flatMap(m => m.category.split(',').map(value => value.trim()).filter(value => value && value !== 'Sem categoria')))).map(label => ({ id: label, label, icon: 'medkit-outline' })), [catalog.data]);
  return <View style={[styles.page, { backgroundColor: colors.background }]}><AppHeader /><ScrollView contentContainerStyle={styles.content}>
    <ScreenHero title={'Olá! ' + (user?.nome?.trim().split(' ')[0] || 'Bem-vindo')} subtitle="Busque o que você necessita." icon="bandage-outline">
      <Pressable accessibilityRole="button" accessibilityLabel="Buscar medicamentos" onPress={() => router.push({ pathname: '/pesquisa', params: { origem: 'home' } })} style={[styles.search, { backgroundColor: colors.surface }]}><AppText variant="label">Buscar medicamento ou categoria</AppText><AppText color={colors.primaryDark}>⌕</AppText></Pressable>
    </ScreenHero>
    <PharmacyMap />
    <AppText variant="h3">Categorias</AppText>
    <CategoryCarousel categories={categories} onSelect={category => router.push({ pathname: '/pesquisa', params: { origem: 'home', filtro: 'medicines', busca: category.label } })} />
    {catalog.loading && <ActivityIndicator color={colors.primaryDark} accessibilityLabel="Carregando categorias" />}
    {!!catalog.error && <View><AppText variant="label">{catalog.error}</AppText><Button compact variant="ghost" title="Tentar novamente" onPress={catalog.reload} /></View>}
    {!catalog.loading && !catalog.error && !categories.length && <AppText variant="label">Nenhuma categoria cadastrada.</AppText>}
  </ScrollView></View>;
}
const styles = StyleSheet.create({ page: { flex: 1 }, content: { padding: 18, gap: 16, paddingBottom: 32 }, heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }, search: { borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, seeAll: { minHeight: 44, justifyContent: 'center' } });
