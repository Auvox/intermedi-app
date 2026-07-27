import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CopyrightFooter } from '@/components/auth/copyright-footer';
import { LoginForm } from '@/components/auth/login-form';
import { AppText } from '@/components/ui/app-text';
import { Wordmark } from '@/components/ui/brand-mark';
import { Colors, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <SafeAreaView style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          <View style={styles.body}>
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
    backgroundColor: Colors.background,
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
