import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/home/app-header';
import { PharmacyPhoto } from '@/components/pharmacy/pharmacy-photo';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { listarFarmacias, enderecoFarmacia } from '@/services/farmacias';
import { useApiResource } from '@/hooks/use-api-resource';
import { Radius, Spacing } from '@/constants/theme';

export default function FarmaciasScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const { data, loading, error, reload } = useApiResource(listarFarmacias);
  const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const termo = normalizar(busca.trim());
  const farmacias = (data ?? []).filter(f => normalizar(`${f.nomeFarmacia} ${enderecoFarmacia(f)}`).includes(termo));
  return <View style={[styles.flex, { backgroundColor: colors.background }]}>
    <AppHeader address="Etec Guaianases" />
    <ScrollView contentContainerStyle={styles.content}>
      <AppText variant="h3">Farmácias cadastradas</AppText>
      <TextField placeholder="Buscar por nome ou endereço" value={busca} onChangeText={setBusca} />
      {loading && <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando farmácias" />}
      {!!error && <View><AppText>{error}</AppText><Pressable accessibilityRole="button" onPress={reload}><AppText color={colors.primary}>Tentar novamente</AppText></Pressable></View>}
      {!loading && !error && farmacias.length === 0 && <AppText>Nenhuma farmácia encontrada.</AppText>}
      {!loading && !error && farmacias.map(f => <View key={f.idFarmacia}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceMuted }]}>
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
  card: { padding: Spacing.lg, gap: Spacing.sm, borderRadius: Radius.lg, borderWidth: 1 },
  cardContent: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, info: { flex: 1, gap: Spacing.sm },
});
