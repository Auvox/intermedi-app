import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/home/app-header';
import { ProfileMenuItem } from '@/components/profile/profile-menu-item';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { currentUser } from '@/constants/mock-data';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function PerfilScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader address="Etec Guaianases" />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={Colors.textOnPrimary} />
          </View>
          <AppText variant="h3" color={Colors.textOnPrimary}>
            Olá, <AppText variant="h3" color={Colors.textOnPrimary} style={styles.bold}>{currentUser.firstName}</AppText>
          </AppText>
        </View>

        <View style={[styles.menuGroup, { borderColor: colors.surfaceMuted }]}>
          <ProfileMenuItem
            icon="moon-outline"
            title="Modo escuro"
            subtitle="Altere a aparência do aplicativo"
            showThemeSwitch
          />
          <ProfileMenuItem
            icon="person-outline"
            title="Meus dados"
            subtitle="Faça alterações na sua conta"
            showWarning
          />
          <ProfileMenuItem icon="log-out-outline" title="Log out" subtitle="Sair da conta" onPress={() => router.replace('/welcome')} />
        </View>

        <AppText variant="h3" color={Colors.textMuted} style={styles.moreTitle}>
          Mais
        </AppText>

        <View style={[styles.menuGroup, { borderColor: colors.surfaceMuted }]}>
          <ProfileMenuItem icon="notifications-outline" title="Ajuda & suporte" />
          <ProfileMenuItem icon="heart-outline" title="Sobre o aplicativo" />
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bold: {
    fontWeight: '800',
  },
  menuGroup: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  moreTitle: {
    marginBottom: -Spacing.md,
  },
});
