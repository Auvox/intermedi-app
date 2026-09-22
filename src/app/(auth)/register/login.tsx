import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/auth/auth-header';
import { LoginForm } from '@/components/auth/login-form';
import { registerSteps, StepIndicator } from '@/components/auth/step-indicator';
import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/context/theme-context';
import { Spacing } from '@/constants/theme';

export default function RegisterLoginScreen() {
  const { colors } = useTheme();
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.primarySoft }]}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <AuthHeader title="Login" showBack />

        <View style={styles.body}>
          <StepIndicator steps={registerSteps} currentIndex={2} />

          <AppText style={[styles.message, { color: colors.textSecondary }]}>Conta criada! Entre com seu e-mail e senha para continuar.</AppText>

          <LoginForm showCreateAccount={false} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  message: { fontSize: 15, lineHeight: 22, marginTop: Spacing.xxl, marginBottom: Spacing.xxl },
});
