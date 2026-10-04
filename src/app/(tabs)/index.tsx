import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/home/app-header';
import { CategoryCarousel } from '@/components/home/category-carousel';
import { ConsultaCard } from '@/components/home/consulta-card';
import { ScreenHero } from '@/components/ui/screen-hero';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { useUser } from '@/context/user-context';
import { categories, medicines } from '@/constants/mock-data';
export default function InicioScreen() {
const router = useRouter(); const { colors } = useTheme(); const { user } = useUser();
  return <View style={[styles.page, { backgroundColor: colors.background }]}><AppHeader /><ScrollView contentContainerStyle={styles.content}>
    <ScreenHero title={'Olá! ' + (user?.nome?.trim().split(' ')[0] || 'Bem-vindo')} subtitle="Busque o que você necessita." icon="bandage-outline">
      <Pressable accessibilityRole="button" accessibilityLabel="Buscar medicamentos" onPress={() => router.push('/buscar-medicamentos')} style={[styles.search, { backgroundColor: colors.surface }]}><AppText variant="label">Buscar medicamento ou categoria</AppText><AppText color={colors.primaryDark}>⌕</AppText></Pressable>
    </ScreenHero>
    <View style={styles.heading}><AppText variant="h3">Categorias principais</AppText><Pressable accessibilityRole="button" onPress={() => router.push('/buscar-medicamentos')}><AppText variant="caption" color={colors.primaryDark}>Ver medicamentos →</AppText></Pressable></View>
    <CategoryCarousel categories={categories} />
    <View style={[styles.rule, { backgroundColor: colors.primary }]} />
    <AppText variant="h3">Consultas de medicamentos</AppText>
    <AppText variant="caption">Explore os medicamentos para consultar seus detalhes.</AppText>
    {medicines.map(m => <ConsultaCard key={m.id} medicine={m} onConsultar={() => router.push({ pathname: '/medicamento/[id]', params: { id: m.id } })} />)}
  </ScrollView></View>;
}
const styles = StyleSheet.create({ page: { flex: 1 }, content: { padding: 18, gap: 16, paddingBottom: 32 }, heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }, search: { borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, rule: { height: 4, width: '100%', borderRadius: 2 } });
