import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { TextField } from '@/components/ui/text-field';
import { medicines } from '@/constants/mock-data';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function BuscarMedicamentosScreen() {
  const router = useRouter();
  const [busca, setBusca] = useState('');

  const medicamentosFiltrados = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton tone="dark" />
        <AppText variant="h2">Buscar medicamentos</AppText>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextField
          placeholder="Digite o nome do medicamento"
          value={busca}
          onChangeText={setBusca}
        />

        <View style={styles.list}>
          {medicamentosFiltrados.map((medicine) => (
            <Pressable
              key={medicine.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/medicamento/[id]',
                  params: { id: medicine.id },
                })
              }>
              <AppText variant="bodyBold">
                {medicine.name} {medicine.dosage}
              </AppText>

              <AppText variant="label" color={Colors.textSecondary}>
                {medicine.category}
              </AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  spacer: {
    width: 40,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  list: {
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
});