import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/home/app-header';
import { CategoryCarousel } from '@/components/home/category-carousel';
import { ConsultaCard } from '@/components/home/consulta-card';
import { AppText } from '@/components/ui/app-text';
import { categories, currentUser, medicines } from '@/constants/mock-data';
import { Colors, Spacing } from '@/constants/theme';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function InicioScreen() {
  const router = useRouter();

  return (
    <View style={styles.flex}>
      <AppHeader address="Etec Guaianases" />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <AppText variant="h2">
            {getGreeting()}, <AppText variant="h2" color={Colors.primary}>{currentUser.firstName}!</AppText>
          </AppText>
          <AppText variant="body" color={Colors.textSecondary}>
            Encontre medicamentos perto de você!
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Categorias Principais
          </AppText>
          <CategoryCarousel categories={categories} />
        </View>

        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Últimas Consultas
          </AppText>
          <View style={styles.consultaList}>
            {medicines.map((medicine, index) => (
              <ConsultaCard
                key={medicine.id}
                medicine={medicine}
                highlighted={index === medicines.length - 1}
                onConsultar={() =>
                  router.push({ pathname: '/medicamento/[id]', params: { id: medicine.id } })
                }
              />
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
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxl,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textMuted,
  },
  consultaList: {
    gap: Spacing.lg,
  },
});
