import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackButton } from '@/components/ui/back-button';
import { AppText } from '@/components/ui/app-text';
import { TextField } from '@/components/ui/text-field';
import { MedicinePhoto } from '@/components/medicine/medicine-photo';
import { getApiAssetUrl } from '@/constants/api';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useApiResource } from '@/hooks/use-api-resource';
import { consultarEstoqueFarmacia } from '@/services/farmacias';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EstoqueFarmaciaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loader = useCallback(() => consultarEstoqueFarmacia(id), [id]);
  const { data, loading, error, reload } = useApiResource(loader);
  const [busca, setBusca] = useState('');
  const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const itens = (data?.estoque ?? []).filter(i => normalizar(`${i.nomeRemedio} ${i.dosagemRemedio ?? ''}`).includes(normalizar(busca.trim())));
  return <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: insets.top }]}>
    <View style={styles.header}><BackButton tone="dark" /><AppText variant="h3" style={styles.info}>{data?.farmacia.nomeFarmacia ?? 'Estoque da farmácia'}</AppText></View>
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Spacing.xxxl + insets.bottom }]}>
      <TextField placeholder="Buscar medicamento ou dosagem" value={busca} onChangeText={setBusca} />
      {loading && <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando estoque" />}
      {!!error && <View><AppText>{error}</AppText><Pressable accessibilityRole="button" onPress={reload}><AppText color={colors.primary}>Tentar novamente</AppText></Pressable></View>}
      {!loading && !error && itens.length === 0 && <AppText>{data?.estoque.length ? 'Nenhum medicamento encontrado para esta busca.' : 'Esta farmácia ainda não possui medicamentos cadastrados no estoque.'}</AppText>}
      {itens.map(i => <Pressable key={i.idEstoque} accessibilityRole="button" accessibilityLabel={`${i.nomeRemedio}, ${i.quantidade} unidades. Ver detalhes`}
        onPress={() => router.push({ pathname: '/medicamento/[id]', params: { id: String(i.idRemedio) } })}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceMuted }]}>
        <View style={styles.row}><MedicinePhoto uri={getApiAssetUrl(i.fotoRemedio)} name={i.nomeRemedio} /><View style={styles.info}>
          <AppText variant="bodyBold">{i.nomeRemedio}</AppText><AppText>{i.dosagemRemedio}</AppText>
        </View></View>
        <AppText variant="h3">{i.quantidade.toLocaleString('pt-BR')} unidades em estoque</AppText>
        <AppText>{i.vencido ? 'Vencido' : i.quantidade === 0 ? 'Sem estoque' : i.critico ? 'Estoque baixo' : 'Em estoque'}</AppText>
        {i.estoqueMinimo != null && <AppText variant="label">Estoque mínimo: {i.estoqueMinimo}</AppText>}
        {!!i.lote && <AppText variant="label">Lote: {i.lote}</AppText>}
        <AppText variant="label">Validade: {i.validade ? i.validade.slice(0, 10).split('-').reverse().join('/') : 'Não informada'}</AppText>
        <AppText color={colors.primary}>Ver detalhes do medicamento →</AppText>
      </Pressable>)}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  content: { padding: Spacing.xl, gap: Spacing.lg }, info: { flex: 1 },
  card: { padding: Spacing.lg, gap: Spacing.sm, borderRadius: Radius.lg, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
});