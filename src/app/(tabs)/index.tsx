import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppHeader } from '@/components/home/app-header';
import { CategoryCarousel } from '@/components/home/category-carousel';
import { ConsultaCard } from '@/components/home/consulta-card';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { categories, medicines } from '@/constants/mock-data';
import { Colors, Spacing } from '@/constants/theme';

type UsuarioLogado = {
  nome?: string;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function InicioScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const usuarioSalvo = await AsyncStorage.getItem('usuario');

        if (!usuarioSalvo) return;

        const usuario: UsuarioLogado = JSON.parse(usuarioSalvo);
        const nome = usuario.nome?.trim();

        if (nome) {
          setNomeUsuario(nome);
        }
      } catch (error) {
        console.error('Erro ao carregar o usuário salvo:', error);
      }
    }

    carregarUsuario();
  }, []);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader address="Etec Guaianases" />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <AppText variant="h2">
            {getGreeting()}
            {nomeUsuario ? (
              <AppText variant="h2" color={Colors.primary}>
                {`, ${nomeUsuario}!`}
              </AppText>
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
