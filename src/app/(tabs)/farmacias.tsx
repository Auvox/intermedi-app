import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/home/app-header';
import { PharmacyCard } from '@/components/pharmacy/pharmacy-card';
import { AppText } from '@/components/ui/app-text';
import { pharmacies } from '@/constants/mock-data';
import { Colors, Spacing } from '@/constants/theme';

export default function FarmaciasScreen() {
  return (
    <View style={styles.flex}>
      <AppHeader address="R. das Flores, 123" />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <AppText variant="h3" style={styles.title}>
          Farmácias perto de você
        </AppText>

        <View style={styles.list}>
          {pharmacies.map((pharmacy) => (
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
});
