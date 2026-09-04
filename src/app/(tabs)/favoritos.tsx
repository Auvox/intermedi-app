import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/home/app-header';
import { FavoriteCard } from '@/components/pharmacy/favorite-card';
import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { useTheme } from '@/context/theme-context';
import { favoritePharmacies } from '@/constants/mock-data';
import { Spacing } from '@/constants/theme';

export default function FavoritosScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader address="Etec Guaianases" />

      <View style={styles.subHeader}>
        <BackButton tone="dark" onPress={() => router.replace('/(tabs)')} />
        <AppText variant="h3" color={colors.textMuted} style={styles.subHeaderTitle}>
          Favoritos
        </AppText>
        <View style={styles.subHeaderSpacer} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          {favoritePharmacies.map((pharmacy) => (
            <FavoriteCard key={pharmacy.id} pharmacy={pharmacy} />
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
  },
  list: {
    gap: Spacing.lg,
  },
});
