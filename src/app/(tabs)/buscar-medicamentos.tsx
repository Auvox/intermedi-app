import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/home/app-header';
import { MedicineCard } from '@/components/medicine/medicine-card';
import { AppText } from '@/components/ui/app-text';
import { TextField } from '@/components/ui/text-field';
import { medicines } from '@/constants/mock-data';
import { Colors, Spacing } from '@/constants/theme';

export default function BuscarMedicamentosScreen() {
  const router = useRouter();
  const [busca, setBusca] = useState('');

  const termo = busca.trim().toLowerCase();
  const medicamentosFiltrados = medicines.filter((medicine) =>
    [medicine.name, medicine.dosage, medicine.category].some((value) =>
      value.toLowerCase().includes(termo),
    ),
  );

  return (
    <View style={styles.flex}>
      <AppHeader address="Etec Guaianases" />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <AppText variant="h3" style={styles.title}>
          Medicamentos perto de você
        </AppText>

        <TextField
          placeholder="Buscar por nome ou categoria"
          value={busca}
          onChangeText={setBusca}
        />

        <View style={styles.list}>
          {medicamentosFiltrados.map((medicine) => (
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

          {medicamentosFiltrados.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
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
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  title: {
    color: Colors.textMuted,
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
    backgroundColor: Colors.primarySoft,
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
