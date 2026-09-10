import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AppHeader } from '@/components/home/app-header';
import { CategoryCarousel } from '@/components/home/category-carousel';
import { ConsultaCard } from '@/components/home/consulta-card';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { useUser } from '@/context/user-context';
import { categories, medicines } from '@/constants/mock-data';
import { Colors, Spacing } from '@/constants/theme';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function InicioScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useUser();
  const nomeUsuario = user?.nome?.trim().split(/\s+/)[0];
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader address="Etec Guaianases" />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <AppText variant="h2" numberOfLines={1} adjustsFontSizeToFit>
            {getGreeting()}
            {nomeUsuario ? (
              <>
                {', '}
                <AppText variant="h2" color={Colors.primary}>{nomeUsuario}</AppText>
                {'!'}
              </>
            ) : (
              '!'
            )}
          </AppText>
          <AppText variant="body" color={colors.textSecondary}>
            Encontre medicamentos perto de você!
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant="h3" color={colors.textMuted} style={styles.sectionTitle}>
            Categorias Principais
          </AppText>
          <CategoryCarousel categories={categories} />
        </View>

        <View style={styles.section}>
          <AppText variant="h3" color={colors.textMuted} style={styles.sectionTitle}>
            Últimas Consultas
          </AppText>
          <View style={styles.consultaList}>
            {medicines.map((medicine) => (
              <ConsultaCard
                key={medicine.id}
                medicine={medicine}
                highlighted={selectedMedicineId === medicine.id}
                onSelect={() => setSelectedMedicineId(medicine.id)}
                onConsultar={() => {
                  setSelectedMedicineId(medicine.id);
                  router.push({ pathname: '/medicamento/[id]', params: { id: medicine.id } });
                }}
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
  sectionTitle: {},
  consultaList: {
    gap: Spacing.lg,
  },
});
