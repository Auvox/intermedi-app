import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppHeader } from '@/components/home/app-header';
import { PharmacyCard } from '@/components/pharmacy/pharmacy-card';
import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { useTheme } from '@/context/theme-context';
import { getMedicineById, getPharmacyById } from '@/constants/mock-data';
import { Radius, Spacing } from '@/constants/theme';

export default function MedicamentoScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const medicine = getMedicineById(id);

  if (!medicine) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <AppHeader address="R. das Flores, 123" />
        <View style={styles.notFound}>
          <AppText variant="body">Medicamento não encontrado.</AppText>
        </View>
      </View>
    );
  }

  const pharmacies = medicine.pharmacyIds
    .map(getPharmacyById)
    .filter((pharmacy): pharmacy is NonNullable<typeof pharmacy> => Boolean(pharmacy));

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader address="Etec Guaianases" />

      <View style={styles.subHeader}>
        <BackButton tone="dark" />
        <AppText variant="h3" style={styles.subHeaderTitle} numberOfLines={1}>
          {medicine.name} {medicine.dosage}
        </AppText>
        <View style={styles.subHeaderSpacer} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <AppText variant="label">Dosagem</AppText>
          <View style={[styles.readonlyBox, { backgroundColor: colors.surfaceMuted }]}>
            <AppText variant="bodyBold" color={colors.textMuted}>
              {medicine.dosage}
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="label">Descrição</AppText>
          <View style={[styles.readonlyBox, styles.descriptionBox, { backgroundColor: colors.surfaceMuted }]}>
            <AppText variant="body" color={colors.textMuted}>
              {medicine.description}
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="h3" color={colors.textMuted}>
            Farmácias Disponíveis
          </AppText>
          <View style={styles.list}>
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
    gap: Spacing.xxl,
  },
  section: {
    gap: Spacing.sm,
  },
  readonlyBox: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  descriptionBox: {
    minHeight: 90,
  },
  list: {
    gap: Spacing.lg,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
