import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SectionHeader } from '@/components/ui/section-header';
import { ProfileMenuItem } from '@/components/profile/profile-menu-item';
import { useTheme } from '@/context/theme-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  return <View style={[styles.page, { backgroundColor: colors.background }]}>
    <SectionHeader title="Configurações" />
    <ScrollView contentContainerStyle={styles.content}>
      <ProfileMenuItem icon="moon-outline" title="Modo escuro" subtitle="Altere a aparência do aplicativo" showThemeSwitch />
      <ProfileMenuItem icon="accessibility-outline" title="Acessibilidade" subtitle="Ajuste o tamanho do texto e o contraste" onPress={() => router.push('/acessibilidade')} />
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({ page: { flex: 1 }, content: { padding: 24, gap: 12 } });
