import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/auth/auth-header';
import { LoginForm } from '@/components/auth/login-form';
import { registerSteps, StepIndicator } from '@/components/auth/step-indicator';
import { Wordmark } from '@/components/ui/brand-mark';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';

export default function RegisterLoginScreen() {
  const { colors } = useTheme();
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <AuthHeader title="Login" showBack />

        <View style={styles.body}>
          <StepIndicator steps={registerSteps} currentIndex={2} />

          <View style={styles.logoWrapper}>
            <Wordmark height={36} />
          </View>

          <LoginForm />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
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
  logoWrapper: {
    alignItems: 'center',
    marginVertical: Spacing.xxl,
  },
});
