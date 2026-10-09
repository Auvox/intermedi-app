import { Button } from '@/components/ui/button';
import { PharmacyPhoto } from '@/components/pharmacy/pharmacy-photo';
import { listarFarmaciasComMedicamento, enderecoFarmacia } from '@/services/farmacias';
import { useApiResource } from '@/hooks/use-api-resource';
import { Ionicons } from '@expo/vector-icons';
import { MedicinePhoto } from '@/components/medicine/medicine-photo';
import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { buscarMedicamento } from '@/services/medicamentos';
import type { Medicine } from '@/constants/mock-data';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';


import { AppHeader } from '@/components/home/app-header';
import { PharmacyCard } from '@/components/pharmacy/pharmacy-card';
import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { useTheme } from '@/context/theme-context';
import { getMedicineById, getPharmacyById } from '@/constants/mock-data';
import { Radius, Spacing } from '@/constants/theme';

const DETAIL_GROUPS = [
  { title: 'Sobre o medicamento', icon: 'information-circle-outline', labels: ['Princípio ativo', 'Categorias', 'Fabricante', 'Tipo'] },
  { title: 'Apresentação e administração', icon: 'medkit-outline', labels: ['Apresentação', 'Forma farmacêutica', 'Via de administração'] },
  { title: 'Receita e classificação', icon: 'document-text-outline', labels: ['Tarja', 'Exige receita', 'Retém receita', 'Registro ANVISA'] },
  { title: 'Indicações e cuidados', icon: 'shield-checkmark-outline', labels: ['Indicações', 'Contraindicações', 'Armazenamento'] },
  { title: 'Dados do cadastro', icon: 'clipboard-outline', labels: ['Código do medicamento', 'Cadastrado em', 'Atualizado em'] },
] as const;

export default function MedicamentoScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const realMedicine = /^\d+$/.test(id ?? '');
  const carregarFarmacias = useCallback(() => realMedicine ? listarFarmaciasComMedicamento(id) : Promise.resolve({ disponiveis: [], consultaIncompleta: false }), [id, realMedicine]);
  const disponibilidade = useApiResource(carregarFarmacias);
  const [medicine, setMedicine] = useState<Medicine | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tentativa, setTentativa] = useState(0);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    setMedicine(undefined);
    setLoading(true);
    setError('');
    // Links antigos da página inicial ainda usam identificadores demonstrativos.
    const consulta = /^\d+$/.test(id ?? '') ? buscarMedicamento(id) : Promise.resolve(getMedicineById(id));
    consulta.then((dados) => { if (ativo) setMedicine(dados); })
      .catch((erro: unknown) => { if (ativo) setError(erro instanceof Error ? erro.message : 'Erro ao carregar medicamento.'); })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [id, tentativa]));

  if (!medicine) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <AppHeader />
        <View style={styles.notFound}>
          <BackButton tone="dark" />
          <AppText variant="body">{loading ? 'Carregando medicamento…' : error || 'Medicamento não encontrado.'}</AppText>
          {!!error && <Pressable accessibilityRole="button" onPress={() => setTentativa((v) => v + 1)}>
            <AppText variant="bodyBold">Tentar novamente</AppText>
          </Pressable>}
        </View>
      </View>
    );
  }

  const pharmacies = medicine.pharmacyIds
    .map(getPharmacyById)
    .filter((pharmacy): pharmacy is NonNullable<typeof pharmacy> => Boolean(pharmacy));

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />

      <View style={styles.subHeader}>
        <BackButton tone="dark" />
        <AppText variant="h3" style={styles.subHeaderTitle} numberOfLines={1}>
          Detalhes do medicamento
        </AppText>
        <View style={styles.subHeaderSpacer} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.hero, { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder }]}>
          {!!medicine.photo && <MedicinePhoto uri={medicine.photo} name={medicine.name} large />}
          <View style={styles.heroHeading}>
            {!medicine.photo && <MedicinePhoto name={medicine.name} />}
            <View style={styles.heroCopy}>
              <AppText variant="h2">{medicine.name}</AppText>
              <AppText variant="label" color={colors.primaryDarker}>{medicine.category}</AppText>
            </View>
          </View>
          <View style={[styles.dosage, { backgroundColor: colors.surface }]}>
            <Ionicons name="medical-outline" size={20} color={colors.primaryDark} />
            <View style={styles.heroCopy}>
              <AppText variant="caption">Dosagem</AppText>
              <AppText variant="bodyBold">{medicine.dosage || 'Não informada'}</AppText>
            </View>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeading}>
            <Ionicons name="reader-outline" size={22} color={colors.primaryDark} />
            <AppText variant="h3" style={styles.heroCopy}>Descrição</AppText>
          </View>
          <AppText color={colors.textSecondary}>{medicine.description}</AppText>
        </View>

        {DETAIL_GROUPS.map(group => {
          const fields = medicine.details?.filter(field => (group.labels as readonly string[]).includes(field.label)) ?? [];
          if (!fields.length) return null;
          return <View key={group.title} style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeading}>
              <Ionicons name={group.icon} size={22} color={colors.primaryDark} />
              <AppText variant="h3" style={styles.heroCopy}>{group.title}</AppText>
            </View>
            {fields.map((field, index) => <View key={field.label} style={[styles.detailRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <AppText variant="label">{field.label}</AppText>
              <AppText color={field.value === 'Não informado' ? colors.textMuted : colors.text}>{field.value}</AppText>
            </View>)}
          </View>;
        })}
        {!!medicine.details?.some(field => !DETAIL_GROUPS.some(group => (group.labels as readonly string[]).includes(field.label))) && <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppText variant="h3">Outras informações</AppText>
          {medicine.details.filter(field => !DETAIL_GROUPS.some(group => (group.labels as readonly string[]).includes(field.label))).map(field => <View key={field.label} style={styles.detailRow}>
            <AppText variant="label">{field.label}</AppText><AppText>{field.value}</AppText>
          </View>)}
        </View>}
        <View style={styles.section}>
          <AppText variant="h3" color={colors.textSecondary}>
            Farmácias disponíveis
          </AppText>
          <View style={styles.list}>
            {realMedicine && disponibilidade.loading && <ActivityIndicator color={colors.primaryDark} accessibilityLabel="Consultando farmácias com estoque" />}
            {realMedicine && !!disponibilidade.error && <View style={styles.section}><AppText color={colors.danger}>{disponibilidade.error}</AppText><Button compact variant="outline" title="Tentar novamente" onPress={disponibilidade.reload} /></View>}
            {realMedicine && disponibilidade.data?.consultaIncompleta && <View style={styles.section}><AppText variant="label">Algumas farmácias não puderam ser consultadas.</AppText><Button compact variant="ghost" title="Atualizar disponibilidade" onPress={disponibilidade.reload} /></View>}
            {realMedicine && !disponibilidade.loading && !disponibilidade.error && disponibilidade.data && !disponibilidade.data.consultaIncompleta && !disponibilidade.data.disponiveis.length && <AppText variant="label">Nenhuma farmácia tem este medicamento disponível no momento.</AppText>}
            {realMedicine && disponibilidade.data?.disponiveis.map(({ farmacia, quantidade }) => <View key={farmacia.idFarmacia} style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.heroHeading}><PharmacyPhoto photo={farmacia.fotoFarmacia} name={farmacia.nomeFarmacia} /><View style={styles.heroCopy}><AppText variant="bodyBold">{farmacia.nomeFarmacia}</AppText><AppText variant="label">{enderecoFarmacia(farmacia)}</AppText></View></View>
              <AppText variant="bodyBold" color={colors.primaryDark}>{quantidade} {quantidade === 1 ? 'unidade disponível' : 'unidades disponíveis'}</AppText>
              <Button compact variant="outline" title="Ver estoque" onPress={() => router.push({ pathname: '/farmacia/[id]', params: { id: String(farmacia.idFarmacia) } })} />
              <Button compact title="Ver rota" onPress={() => router.push({ pathname: '/rota', params: { farmaciaId: String(farmacia.idFarmacia) } })} />
            </View>)}
            {pharmacies.map((pharmacy) => (
              <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  subHeaderTitle: {
    flex: 1,
    textAlign: 'center',
  },
  subHeaderSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  hero: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.lg },
  heroHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroCopy: { flex: 1, minWidth: 0 },
  dosage: { borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  infoCard: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.lg, gap: Spacing.sm },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  detailRow: { paddingVertical: Spacing.sm, gap: Spacing.xs },
  list: {
    gap: Spacing.lg,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
