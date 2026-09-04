import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View,  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
import { CopyrightFooter } from '@/components/auth/copyright-footer';
import { LoginForm } from '@/components/auth/login-form';
import { AppText } from '@/components/ui/app-text';
import { Wordmark } from '@/components/ui/brand-mark';
import { useTheme } from '@/context/theme-context';
import { Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <SafeAreaView style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          <View style={styles.body}>
            <BackButton tone="dark" onPress={() => router.replace('/welcome')} />
            <AppText variant="h1" style={styles.title}>
              Login
            </AppText>

            <View style={styles.logoWrapper}>
              <Wordmark height={36} />
            </View>

            <LoginForm />
          </View>

          <CopyrightFooter />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  body: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    marginVertical: Spacing.xxl,
  },
});
