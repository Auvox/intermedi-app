import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/ui/brand-mark';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <SafeAreaView style={styles.flex}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <Wordmark height={24} />
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          <View style={styles.iconWrapper}>
            <Ionicons name="shield" size={140} color={Colors.primary} />
            <View style={styles.iconOverlay}>
              <Ionicons name="lock-closed" size={54} color={Colors.textOnPrimary} />
            </View>
          </View>

          <AppText variant="h3" style={styles.description}>
            A recuperação de senha ainda não está disponível nesta versão. Entre com sua senha para acessar sua conta.
          </AppText>

          <Button
            title="Voltar ao login"
            onPress={() => router.replace('/login')}
            style={styles.submitButton}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: Spacing.xxl,
  },
  iconOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    textAlign: 'center',
    fontWeight: '400',
  },
  bold: {
    fontWeight: '800',
  },
  form: {
    marginTop: Spacing.xxl,
  },
  submitButton: {
    marginTop: Spacing.xxl,
  },
});
