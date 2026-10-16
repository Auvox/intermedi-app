import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MedicineThumb } from '@/components/medicine/medicine-thumb';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EmptyState, Tag } from '@/components/ui/surface';
import { getApiAssetUrl } from '@/constants/api';
import { FontFamily, NoOutline, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useApiResource } from '@/hooks/use-api-resource';
import { consultarEstoqueFarmacia } from '@/services/farmacias';
import { POUCAS_UNIDADES } from '@/services/disponibilidade';

export default function EstoqueFarmaciaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, textScale } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loader = useCallback(() => consultarEstoqueFarmacia(id), [id]);
  const { data, loading, error, reload } = useApiResource(loader);
  const [busca, setBusca] = useState('');
  const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const itens = (data?.estoque ?? []).filter(i => normalizar(`${i.nomeRemedio} ${i.dosagemRemedio ?? ''}`).includes(normalizar(busca.trim())));
  const disponiveis = (data?.estoque ?? []).filter(i => i.quantidade > 0 && !i.vencido).length;
  return <View style={[styles.flex, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
      <ScreenHeader back title={data?.farmacia.nomeFarmacia ?? 'Estoque da farmácia'} subtitle={data ? `${disponiveis} ${disponiveis === 1 ? 'remédio disponível' : 'remédios disponíveis'}` : undefined}
        right={<Pressable accessibilityRole="button" accessibilityLabel="Ver rota até a farmácia" onPress={() => router.push({ pathname: '/rota', params: { farmaciaId: id } })} style={styles.route}>
          <Ionicons name="navigate-outline" size={22} color="#FFFFFF" />
        </Pressable>}>
        <View style={[styles.search, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput value={busca} onChangeText={setBusca} placeholder="Buscar remédio ou dosagem" placeholderTextColor={colors.textMuted} accessibilityLabel="Buscar remédio ou dosagem"
            style={[styles.input, { color: colors.text, fontSize: 15 * textScale }]} />
        </View>
      </ScreenHeader>
      <View style={styles.content}>
        {loading && <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando estoque" />}
        {!!error && <View><AppText>{error}</AppText><Button compact variant="ghost" title="Tentar novamente" onPress={reload} /></View>}
        {!loading && !error && itens.length === 0 && <EmptyState icon="cube-outline" title={data?.estoque.length ? 'Nada encontrado' : 'Estoque vazio'} text={data?.estoque.length ? 'Nenhum medicamento encontrado para esta busca.' : 'Esta farmácia ainda não possui medicamentos cadastrados no estoque.'} />}
        {itens.map(i => {
          const status = i.vencido ? { label: 'Vencido', tone: 'red' as const } : i.quantidade === 0 ? { label: 'Sem estoque', tone: 'neutral' as const } : i.critico || i.quantidade < POUCAS_UNIDADES ? { label: 'Poucas unid.', tone: 'amber' as const } : { label: 'Em estoque', tone: 'green' as const };
          return <Pressable key={i.idEstoque} accessibilityRole="button" accessibilityLabel={`${i.nomeRemedio}, ${i.quantidade} unidades. Ver detalhes`}
            onPress={() => router.push({ pathname: '/medicamento/[id]', params: { id: String(i.idRemedio) } })}
            style={({ pressed }) => [styles.card, { backgroundColor: colors.surface }, Shadow, pressed && styles.pressed]}>
            <MedicineThumb uri={getApiAssetUrl(i.fotoRemedio)} name={i.nomeRemedio} size={58} />
            <View style={styles.info}>
              <AppText variant="bodyBold" numberOfLines={2}>{i.nomeRemedio} {i.dosagemRemedio}</AppText>
              <AppText variant="label">{i.quantidade.toLocaleString('pt-BR')} unidades · validade {i.validade ? i.validade.slice(0, 10).split('-').reverse().join('/') : 'não informada'}</AppText>
              {!!i.lote && <AppText variant="caption">Lote {i.lote}</AppText>}
              <Tag label={status.label} tone={status.tone} style={styles.tag} />
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>;
        })}
      </View>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  route: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, paddingHorizontal: 16, minHeight: 54 },
  input: { flex: 1, minWidth: 0, fontFamily: FontFamily.regular, paddingVertical: 10, ...NoOutline },
  content: { padding: 18, paddingTop: Spacing.xl, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 22, padding: 14 },
  pressed: { opacity: 0.85 },
  info: { flex: 1, minWidth: 0, gap: 2 },
  tag: { marginTop: 6 },
});
