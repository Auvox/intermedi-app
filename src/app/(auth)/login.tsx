import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
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
      style={[styles.flex, { backgroundColor: colors.primarySoft }]}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <SafeAreaView style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          <View style={styles.topGlow} />
          <View style={styles.body}>
            <BackButton tone="dark" onPress={() => router.replace('/welcome')} />
            <View style={styles.logoWrapper}><Wordmark height={64} /></View>
            <AppText style={[styles.title, { color: colors.text }]}>Bem-vindo de volta!</AppText>
            <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>Faça login para continuar</AppText>
            <View style={styles.form}><LoginForm /></View>
          </View>
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#DCF9E9',
    top: -110,
    right: -90
  },
  body: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingVertical: 20
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginTop: 46
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: 12,
  },
  form: {
    marginTop: 38
  },
});
