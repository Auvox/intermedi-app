import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MedicineCard } from '@/components/medicine/medicine-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EmptyState } from '@/components/ui/surface';
import { FontFamily, Spacing, toneColors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useApiResource } from '@/hooks/use-api-resource';
import { mapaDisponibilidade } from '@/services/disponibilidade';
import { listarMedicamentos } from '@/services/medicamentos';
import { categoryStyle, splitCategories } from '@/utils/medicine-style';

export default function MedicamentosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { categoria } = useLocalSearchParams<{ categoria?: string }>();
  const { data, loading, error, reload } = useApiResource(listarMedicamentos);
  const disponibilidade = useApiResource(mapaDisponibilidade);
  const [selected, setSelected] = useState<string>(categoria ?? '');
  // Ao chegar de outra tela com uma categoria, seleciona o filtro correspondente.
  const [lastCategoria, setLastCategoria] = useState(categoria);
  if (categoria !== lastCategoria) { setLastCategoria(categoria); if (categoria !== undefined) setSelected(categoria); }
  const categories = useMemo(() => Array.from(new Set((data ?? []).flatMap(m => splitCategories(m.category)))).sort((a, b) => a.localeCompare(b, 'pt-BR')), [data]);
  const list = (data ?? []).filter(m => !selected || splitCategories(m.category).includes(selected));
  const countFor = (id: string) => disponibilidade.data ? (disponibilidade.data.porRemedio[id]?.length ?? 0) : undefined;
  const withStock = disponibilidade.data ? list.filter(m => (countFor(m.id) ?? 0) > 0).length : undefined;

  return <View style={[styles.flex, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={styles.scroll}>
      <ScreenHeader title="Remédios" subtitle="Encontre o que você precisa">
        <Pressable accessibilityRole="button" accessibilityLabel="Buscar por nome ou categoria" onPress={() => router.push({ pathname: '/pesquisa', params: { filtro: 'medicines', origem: 'remedios' } })} style={[styles.search, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={22} color={colors.textSecondary} />
          <AppText color={colors.textMuted} style={styles.flex}>Buscar por nome ou categoria</AppText>
        </Pressable>
      </ScreenHeader>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Pressable accessibilityRole="tab" accessibilityState={{ selected: !selected }} onPress={() => setSelected('')} style={[styles.chip, { backgroundColor: !selected ? colors.text : colors.surface }]}>
          <AppText variant="label" color={!selected ? colors.background : colors.text} style={styles.chipText}>Todos</AppText>
        </Pressable>
        {categories.map(label => {
          const { bg, fg } = toneColors(colors, categoryStyle(label).tone);
          const active = selected === label;
          return <Pressable key={label} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setSelected(active ? '' : label)} style={[styles.chip, { backgroundColor: active ? fg : bg }]}>
            <View style={[styles.dot, { backgroundColor: active ? '#FFFFFF' : fg }]} />
            <AppText variant="label" color={active ? '#FFFFFF' : fg} style={styles.chipText}>{label}</AppText>
          </Pressable>;
        })}
      </ScrollView>
      <View style={styles.content}>
        {!loading && !error && <AppText variant="label">{withStock != null ? `${withStock} ${withStock === 1 ? 'remédio' : 'remédios'} com estoque perto de você` : `${list.length} ${list.length === 1 ? 'remédio' : 'remédios'} · consultando estoque…`}</AppText>}
        {loading && <ActivityIndicator color={colors.primaryDark} accessibilityLabel="Carregando medicamentos" />}
        {!!error && <View><AppText>{error}</AppText><Button title="Tentar novamente" compact variant="ghost" onPress={reload} /></View>}
        {!loading && !error && !list.length && <EmptyState icon="bandage-outline" title="Nenhum remédio encontrado" text={selected ? 'Não há remédios cadastrados nesta categoria.' : 'Nenhum medicamento cadastrado.'} />}
        {!loading && !error && list.map(medicine => <MedicineCard key={medicine.id} medicine={medicine} pharmacyCount={countFor(medicine.id)} onPress={() => router.push({ pathname: '/medicamento/[id]', params: { id: medicine.id } })} />)}
      </View>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 120 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, paddingHorizontal: 18, minHeight: 58 },
  chips: { paddingHorizontal: 18, paddingTop: 18, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 22, paddingHorizontal: 18, minHeight: 44 },
  chipText: { fontFamily: FontFamily.medium },
  dot: { width: 8, height: 8, borderRadius: 4 },
  content: { paddingHorizontal: 18, paddingTop: Spacing.lg, gap: 14 },
});
