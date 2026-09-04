import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TextField } from '@/components/ui/text-field';
import { AppHeader } from '@/components/home/app-header';
import { PharmacyCard } from '@/components/pharmacy/pharmacy-card';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { pharmacies } from '@/constants/mock-data';
import { Spacing } from '@/constants/theme';

export default function FarmaciasScreen() {
  const { colors } = useTheme();
  const [busca, setBusca] = useState('');

  const farmaciasFiltradas = pharmacies.filter((pharmacy) => {
  const termo = busca.toLowerCase();

  return (
    pharmacy.name.toLowerCase().includes(termo) ||
    pharmacy.address.toLowerCase().includes(termo)
  );
});
  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader address="Etec Guaianases" />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <AppText variant="h3" color={colors.textMuted}>
          Farmácias perto de você
        </AppText>
        
        <TextField
          placeholder="Buscar por nome ou endereço"
          value={busca}
          onChangeText={setBusca}
        />

        <View style={styles.list}>
          {farmaciasFiltradas.map((pharmacy) => (
            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
          ))}
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
});
