import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { BackButton } from '@/components/ui/back-button';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function NotificacoesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton tone="dark" />
        <AppText variant="h2">Notificações</AppText>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.notification}>
          <AppText variant="h3">Medicamento disponível</AppText>
          <AppText variant="body" color={Colors.textSecondary}>
            Teste 
          </AppText>
        </View>

        <View style={styles.notification}>
          <AppText variant="h3">Bem-vindo ao Intermed!</AppText>
          <AppText variant="body" color={Colors.textSecondary}>
           Teste 2
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    gap: Spacing.md,
  },
  notification: {
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
});