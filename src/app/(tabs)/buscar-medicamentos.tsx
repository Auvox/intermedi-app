import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppHeader } from '@/components/home/app-header';
import { MedicineCard } from '@/components/medicine/medicine-card';
import { AppText } from '@/components/ui/app-text';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/context/theme-context';
import type { Medicine } from '@/constants/mock-data';
import { listarMedicamentos } from '@/services/medicamentos';
import { Colors, Spacing } from '@/constants/theme';

export default function BuscarMedicamentosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [busca, setBusca] = useState('');

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tentativa, setTentativa] = useState(0);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    setLoading(true);
    setError('');
    listarMedicamentos().then((dados) => {
      if (ativo) setMedicines(dados);
    }).catch((erro: unknown) => {
      if (ativo) setError(erro instanceof Error ? erro.message : 'Erro ao carregar medicamentos.');
    }).finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [tentativa]));

  const termo = busca.trim().toLowerCase();
  const medicamentosFiltrados = medicines.filter((medicine) =>
    [medicine.name, medicine.dosage, medicine.category].some((value) =>
      value.toLowerCase().includes(termo),
    ),
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader address="Etec Guaianases" />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <AppText variant="h3" color={colors.textMuted}>
          Medicamentos cadastrados
        </AppText>

        <TextField
          placeholder="Buscar por nome ou categoria"
          value={busca}
          onChangeText={setBusca}
        />

        <View style={styles.list}>
          {loading && <ActivityIndicator accessibilityLabel="Carregando medicamentos" color={Colors.primary} />}
          {!!error && <View style={styles.emptyState}>
            <AppText variant="body">{error}</AppText>
            <Pressable accessibilityRole="button" onPress={() => setTentativa((v) => v + 1)}>
              <AppText variant="bodyBold" color={Colors.primary}>Tentar novamente</AppText>
            </Pressable>
          </View>}
          {!loading && !error && medicamentosFiltrados.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onPress={() =>
                router.push({
                  pathname: '/medicamento/[id]',
                  params: { id: medicine.id },
                })
              }
            />
          ))}

          {!loading && !error && medicamentosFiltrados.length === 0 && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
                <AppText variant="h3" color={Colors.primary}>
                  ?
                </AppText>
              </View>
              <AppText variant="bodyBold" style={styles.emptyTitle}>
                Nenhum medicamento encontrado
              </AppText>
              <AppText variant="label" style={styles.emptyText}>
                Tente buscar pelo nome, dosagem ou categoria.
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  list: {
    gap: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});
